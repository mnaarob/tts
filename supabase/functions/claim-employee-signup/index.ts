/**
 * claim-employee-signup — Employee self-registration using store name +
 * pending-invite employee_id.
 *
 * Behaviour:
 *  - If no Auth user exists for the supplied email yet, create one
 *    (email_confirm = true since the manager already vouches for the
 *    address by entering it on the invite) and link store_admins.
 *  - If an Auth user *already* exists for that email, this function
 *    deliberately refuses to create / overwrite credentials. It returns
 *    `code: "account_exists"` so the client can ask the user to sign in
 *    with their real password and finish the link via the
 *    `claim_employee_invite` RPC. This closes the account-takeover path
 *    where anyone with (store_name, employee_id, email) could reset the
 *    user's password.
 *
 * Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional secrets:
 *   TURNSTILE_SECRET_KEY  — when set, CAPTCHA is required.
 *   ALLOWED_ORIGINS       — comma-separated allow-list (e.g.
 *                           "https://app.example.com,https://staging.example.com").
 *                           Falls back to "*" only when unset, which is
 *                           appropriate for early local dev.
 *
 * Deploy: supabase functions deploy claim-employee-signup
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// Generic, identical-looking error so we never tell an attacker which of
// (store, employee_id, email) was wrong.
const GENERIC_INVITE_ERROR =
  'Invalid store name, Employee ID, or email. Ask your manager to verify your invite.';

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  let allow: string;
  if (ALLOWED_ORIGINS.length === 0) {
    allow = '*'; // dev fallback only
  } else if (ALLOWED_ORIGINS.includes(origin)) {
    allow = origin;
  } else {
    // Pick the first allow-listed origin as the canonical value so browsers
    // still get a meaningful preflight response when called from elsewhere.
    allow = ALLOWED_ORIGINS[0];
  }
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

type Body = {
  store_name?: string;
  employee_id?: string;
  email?: string;
  password?: string;
  captchaToken?: string;
};

type ResponseCode = 'account_exists' | 'invalid' | 'rate_limited' | 'server_error';

function json(body: Record<string, unknown>, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function errResponse(message: string, cors: Record<string, string>, code: ResponseCode = 'invalid') {
  return json({ ok: false, error: message, code }, 200, cors);
}

function isEmailAlreadyRegisteredError(msg: string | undefined): boolean {
  if (!msg) return false;
  return /already\s*registered|already\s*been\s*registered|already\s*exists|User already registered|duplicate/i.test(
    msg,
  );
}

/** Escape PostgREST ilike wildcards so a value like '%' can't match every row. */
function escapeLikePattern(value: string): string {
  return value.replace(/([\\%_])/g, '\\$1');
}

/** Email validation. Loose RFC-5322-ish — fully validating against RFC is impractical and Auth re-checks. */
function isPlausibleEmail(email: string): boolean {
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp?: string,
): Promise<boolean> {
  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteIp) body.set('remoteip', remoteIp);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.error('turnstile siteverify', e);
    return false;
  }
}

serve(async (req) => {
  const cors = buildCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed', code: 'invalid' }, 405, cors);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY')?.trim();

    if (!supabaseUrl || !serviceKey) {
      console.error('claim-employee-signup misconfigured: missing SUPABASE_URL/SERVICE_ROLE_KEY');
      return errResponse('Server configuration error', cors, 'server_error');
    }

    let body: Body;
    try {
      body = (await req.json()) as Body;
    } catch {
      return errResponse('Invalid JSON body', cors);
    }

    const storeName = body.store_name?.trim();
    const employeeRaw = body.employee_id?.trim();
    const email = body.email?.trim();
    const password = body.password ?? '';
    const captchaToken = body.captchaToken?.trim();

    if (!storeName || !employeeRaw || !email || !password) {
      return errResponse('Missing store name, employee ID, email, or password', cors);
    }

    if (storeName.length > 200) {
      return errResponse(GENERIC_INVITE_ERROR, cors);
    }
    if (!isPlausibleEmail(email)) {
      return errResponse(GENERIC_INVITE_ERROR, cors);
    }
    // Match the client-side policy. Real validation lives in Supabase Auth.
    if (password.length < 8 || password.length > 128) {
      return errResponse('Password must be at least 8 characters.', cors);
    }

    const empUpper = employeeRaw.toUpperCase().slice(0, 6);
    if (!/^[A-Z0-9]{6}$/.test(empUpper)) {
      return errResponse('Employee ID must be exactly 6 alphanumeric characters', cors);
    }

    if (turnstileSecret) {
      if (!captchaToken) {
        return errResponse('Complete the CAPTCHA verification', cors);
      }
      const remoteIp =
        req.headers.get('cf-connecting-ip') ??
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        undefined;
      const ok = await verifyTurnstile(captchaToken, turnstileSecret, remoteIp);
      if (!ok) {
        return errResponse('CAPTCHA verification failed', cors);
      }
    } else {
      // Loud warning — running this endpoint open to the internet without
      // CAPTCHA + rate limiting is a brute-force invite for credential stuffing.
      console.warn('claim-employee-signup running without TURNSTILE_SECRET_KEY');
    }

    const normalizedEmail = email.toLowerCase();
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: store, error: storeErr } = await admin
      .from('stores')
      .select('id')
      .ilike('name', escapeLikePattern(storeName))
      .maybeSingle();

    if (storeErr) {
      console.error('stores', storeErr);
      // Don't leak which step failed.
      return errResponse(GENERIC_INVITE_ERROR, cors);
    }
    if (!store?.id) {
      return errResponse(GENERIC_INVITE_ERROR, cors);
    }

    const { data: invite, error: invErr } = await admin
      .from('store_invites')
      .select('id, role, employee_id, email, full_name')
      .eq('store_id', store.id)
      .eq('employee_id', empUpper)
      .maybeSingle();

    if (invErr) {
      console.error('store_invites', invErr);
      return errResponse(GENERIC_INVITE_ERROR, cors);
    }
    if (!invite) {
      return errResponse(GENERIC_INVITE_ERROR, cors);
    }

    const inviteEmail = typeof invite.email === 'string' ? invite.email.trim().toLowerCase() : '';
    if (!inviteEmail || inviteEmail !== normalizedEmail) {
      return errResponse(GENERIC_INVITE_ERROR, cors);
    }

    const displayName =
      typeof invite.full_name === 'string' && invite.full_name.trim() !== ''
        ? invite.full_name.trim()
        : undefined;

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: displayName ? { full_name: displayName } : undefined,
    });

    if (createErr && isEmailAlreadyRegisteredError(createErr.message)) {
      // === SECURITY: refuse to overwrite an existing account ===
      // We used to silently change the existing account's password and link
      // store_admins right here. That meant anyone with the right invite
      // (which a malicious manager can create) could permanently lock the
      // real owner out of an unrelated account. We now stop here and let
      // the *authenticated* user finish linking via the
      // `claim_employee_invite` RPC after a normal sign-in.
      return json(
        {
          ok: false,
          code: 'account_exists',
          error:
            'You already have an account with this email. Sign in with your existing password — we will link your invite automatically.',
        },
        200,
        cors,
      );
    }

    let userId: string;
    let deleteUserOnRollback = false;

    if (!createErr && created?.user?.id) {
      userId = created.user.id;
      deleteUserOnRollback = true;
    } else if (createErr) {
      // Some other createUser error — keep messages internal so we don't leak details.
      console.error('createUser', createErr);
      return errResponse('Could not create account. Please try again.', cors, 'server_error');
    } else {
      console.error('createUser returned no user without error');
      return errResponse('Could not create account. Please try again.', cors, 'server_error');
    }

    // Belt and braces: even though we just created the user, double-check
    // they aren't already a member (concurrent retry, etc.).
    const { data: alreadyMember } = await admin
      .from('store_admins')
      .select('user_id')
      .eq('store_id', store.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (alreadyMember) {
      // Don't roll back the user — they exist and are already in the store.
      return json({ ok: true, message: 'Already linked' }, 200, cors);
    }

    const { error: saErr } = await admin.from('store_admins').insert({
      store_id: store.id,
      user_id: userId,
      role: invite.role,
      employee_id: empUpper,
      ...(displayName ? { display_name: displayName } : {}),
    });

    if (saErr) {
      console.error('store_admins insert', saErr);
      if (deleteUserOnRollback) {
        await admin.auth.admin.deleteUser(userId);
      }
      return errResponse('Could not complete signup. Please try again.', cors, 'server_error');
    }

    const { error: delErr } = await admin.from('store_invites').delete().eq('id', invite.id);
    if (delErr) {
      console.error('store_invites delete', delErr);
    }

    return json({ ok: true, message: 'Welcome to the team' }, 200, cors);
  } catch (e) {
    console.error('claim-employee-signup unexpected', e);
    return errResponse('Unexpected error', cors, 'server_error');
  }
});
