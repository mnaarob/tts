/**
 * claim-employee-signup — Employee self-registration using store name + pending invite employee_id.
 * Creates Auth user (email confirmed) and store_admins; removes store_invites row.
 * Deploy: supabase functions deploy claim-employee-signup
 *
 * Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY (optional for CORS)
 * Optional: TURNSTILE_SECRET_KEY — if set, captchaToken is verified with Cloudflare.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Body = {
  store_name?: string;
  employee_id?: string;
  email?: string;
  password?: string;
  captchaToken?: string;
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errResponse(message: string) {
  return json({ ok: false, error: message }, 200);
}

async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY')?.trim();

    if (!supabaseUrl || !serviceKey) {
      return errResponse('Server configuration error');
    }

    let body: Body;
    try {
      body = (await req.json()) as Body;
    } catch {
      return errResponse('Invalid JSON body');
    }

    const storeName = body.store_name?.trim();
    const employeeRaw = body.employee_id?.trim();
    const email = body.email?.trim();
    const password = body.password;
    const captchaToken = body.captchaToken?.trim();

    if (!storeName || !employeeRaw || !email || !password) {
      return errResponse('Missing store name, employee ID, email, or password');
    }

    if (password.length < 6) {
      return errResponse('Password must be at least 6 characters');
    }

    const empUpper = employeeRaw.toUpperCase().slice(0, 6);
    if (empUpper.length !== 6) {
      return errResponse('Employee ID must be exactly 6 characters');
    }

    if (turnstileSecret) {
      if (!captchaToken) {
        return errResponse('Complete the CAPTCHA verification');
      }
      const ok = await verifyTurnstile(captchaToken, turnstileSecret);
      if (!ok) {
        return errResponse('CAPTCHA verification failed');
      }
    }

    const normalizedEmail = email.toLowerCase();
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: store, error: storeErr } = await admin
      .from('stores')
      .select('id')
      .ilike('name', storeName)
      .maybeSingle();

    if (storeErr) {
      console.error('stores', storeErr);
      return errResponse('Could not look up store');
    }
    if (!store?.id) {
      return errResponse('No store found with that name. Check spelling with your manager.');
    }

    const { data: invite, error: invErr } = await admin
      .from('store_invites')
      .select('id, role, employee_id')
      .eq('store_id', store.id)
      .eq('employee_id', empUpper)
      .maybeSingle();

    if (invErr) {
      console.error('store_invites', invErr);
      return errResponse('Could not verify invite');
    }
    if (!invite) {
      return errResponse(
        'No pending invite for this store and Employee ID. Ask your manager to add you in Team, or check the ID and store name.',
      );
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    });

    if (createErr || !created?.user?.id) {
      const msg = createErr?.message ?? 'Could not create account';
      if (/already\s*registered|already\s*been\s*registered|exists/i.test(msg)) {
        return errResponse('That email is already registered. Try Sign in.');
      }
      console.error('createUser', createErr);
      return errResponse(msg);
    }

    const userId = created.user.id;

    const { error: saErr } = await admin.from('store_admins').insert({
      store_id: store.id,
      user_id: userId,
      role: invite.role,
      employee_id: empUpper,
    });

    if (saErr) {
      console.error('store_admins insert', saErr);
      await admin.auth.admin.deleteUser(userId);
      return errResponse(saErr.message ?? 'Could not complete signup');
    }

    const { error: delErr } = await admin.from('store_invites').delete().eq('id', invite.id);
    if (delErr) {
      console.error('store_invites delete', delErr);
    }

    return json({ ok: true, message: 'Account created' }, 200);
  } catch (e) {
    console.error(e);
    return errResponse(e instanceof Error ? e.message : 'Unexpected error');
  }
});
