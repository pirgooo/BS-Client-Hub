// =====================================================================
//  admin-create-client — creates a client account
//
//  Creating a user needs the service role key, which bypasses row level
//  security entirely. That key can never go near the browser, so account
//  creation lives here instead: the function checks that the caller is
//  an administrator, and only then creates the account.
//
//  Deploy:  supabase functions deploy admin-create-client
//  or paste it into Dashboard -> Edge Functions -> Deploy a new function.
//
//  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by the
//  platform; nothing needs to be configured by hand.
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return reply({ error: 'Use POST' }, 405);

  const url         = Deno.env.get('SUPABASE_URL')!;
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  if (!url || !serviceKey) return reply({ error: 'The function is missing its environment' }, 500);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // ---- 1. who is calling? ----
  const authHeader = req.headers.get('Authorization') || '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) return reply({ error: 'Not signed in' }, 401);

  const { data: caller, error: callerError } = await admin.auth.getUser(jwt);
  if (callerError || !caller?.user) return reply({ error: 'Not signed in' }, 401);

  // ---- 2. are they allowed to do this? ----
  const { data: callerProfile } = await admin
    .from('profiles').select('role').eq('id', caller.user.id).maybeSingle();

  if (!callerProfile || callerProfile.role !== 'admin') {
    return reply({ error: 'Administrators only' }, 403);
  }

  // ---- 3. the request ----
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply({ error: 'Malformed request' }, 400);
  }

  const email    = String(body.email    ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (!email || !email.includes('@')) return reply({ error: 'A valid email is required' }, 400);
  if (password.length < 8)            return reply({ error: 'The password must be at least 8 characters' }, 400);

  // ---- 4. create the account ----
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,            // no confirmation mail: the admin hands over the password
    user_metadata: {
      full_name: body.full_name ?? null,
      company:   body.company   ?? null,
      city:      body.city      ?? null,
      phone:     body.phone     ?? null,
    },
  });

  if (createError) {
    const already = /already|exists|registered/i.test(createError.message);
    return reply({ error: already ? 'That email already has an account' : createError.message },
                 already ? 409 : 400);
  }

  // ---- 5. fill in the rest of the profile ----
  // The on_auth_user_created trigger has already made the row.
  const patch: Record<string, unknown> = {};
  for (const key of [
    'full_name', 'company', 'city', 'address', 'phone', 'whatsapp',
    'website', 'social_facebook', 'social_instagram', 'social_telegram',
    'about', 'logo_url',
    'manager_name', 'manager_contact', 'manager_whatsapp',
    'plan', 'subscription_from', 'subscription_until',
    'role', 'status',
  ]) {
    const v = body[key];
    if (v !== undefined && v !== '') patch[key] = v;
  }

  let profile = null;
  if (Object.keys(patch).length) {
    const { data, error } = await admin
      .from('profiles').update(patch).eq('id', created.user.id).select().maybeSingle();

    // The account exists either way — a failed patch is worth reporting,
    // not worth pretending the whole thing failed.
    if (error) {
      return reply({
        user_id: created.user.id,
        email,
        warning: 'The account was created, but the profile could not be filled in: ' + error.message,
      }, 207);
    }
    profile = data;
  }

  return reply({ user_id: created.user.id, email, profile }, 201);
});
