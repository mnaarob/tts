/**
 * invite-employee — Team invites (Auth Admin + store_admins).
 * Deploy: supabase functions deploy invite-employee
 *
 * Env (auto-injected on Supabase): SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 * Optional: INVITE_REDIRECT_URL — Site URL after user accepts invite (must be in Auth redirect allow list)
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Body = {
  store_id?: string;
  email?: string;
  role?: string;
  employee_id?: string;
};

/** Prefer HTTP 200 + `{ ok, error }` so the JS client's `invoke()` always parses the body. */
function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function okResponse(extra: Record<string, unknown> = {}) {
  return json({ ok: true, ...extra }, 200);
}

function errResponse(message: string) {
  return json({ ok: false, error: message }, 200);
}

async function findUserIdByEmail(admin: SupabaseClient, email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  let page = 1;
  const perPage = 1000;
  for (let i = 0; i < 20; i++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) return null;
    if (!data?.users?.length) return null;
    const found = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (found) return found.id;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceKey || !anonKey) {
      return errResponse('Server configuration error');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errResponse('Missing or invalid authorization');
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return errResponse('Invalid or expired session');
    }

    let body: Body;
    try {
      body = (await req.json()) as Body;
    } catch {
      return errResponse('Invalid JSON body');
    }

    const storeId = body.store_id?.trim();
    const email = body.email?.trim();
    const role = body.role?.trim();
    const employeeId = body.employee_id?.trim();

    if (!storeId || !email || !role || !employeeId) {
      return errResponse('Missing store_id, email, role, or employee_id');
    }

    if (!['manager', 'staff'].includes(role)) {
      return errResponse('role must be manager or staff');
    }

    const normalizedEmail = email.toLowerCase();
    const empUpper = employeeId.toUpperCase().slice(0, 6);

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: callerRow, error: callerErr } = await admin
      .from('store_admins')
      .select('role')
      .eq('store_id', storeId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (callerErr) {
      console.error('caller lookup', callerErr);
      return errResponse('Could not verify permissions');
    }

    if (!callerRow || !['owner', 'manager'].includes(callerRow.role)) {
      return errResponse('Only owners and managers can invite team members');
    }

    let targetUserId: string | null = null;

    const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      normalizedEmail,
      {
        data: { invited_to_store: storeId },
        redirectTo: Deno.env.get('INVITE_REDIRECT_URL') ?? undefined,
      },
    );

    if (!inviteErr && inviteData?.user?.id) {
      targetUserId = inviteData.user.id;
    } else {
      // User may already exist — link them to the store without re-sending invite
      targetUserId = await findUserIdByEmail(admin, normalizedEmail);
      if (!targetUserId) {
        return errResponse(inviteErr?.message ?? 'Could not invite or find user by email');
      }
    }

    const { data: dupMember } = await admin
      .from('store_admins')
      .select('user_id')
      .eq('store_id', storeId)
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (dupMember) {
      return errResponse('This user is already a member of this store');
    }

    const { error: insertErr } = await admin.from('store_admins').insert({
      store_id: storeId,
      user_id: targetUserId,
      role,
      employee_id: empUpper,
    });

    if (insertErr) {
      console.error('store_admins insert', insertErr);
      return errResponse(insertErr.message);
    }

    return okResponse({ message: 'Invite sent' });
  } catch (e) {
    console.error(e);
    return errResponse(e instanceof Error ? e.message : 'Unexpected error');
  }
});
