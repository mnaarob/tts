/** Public contact form → delivers to CONTACT_TO (default contact@techtostore.com).
 * Prefer Namecheap SMTP when SMTP_USER/SMTP_PASS are set; otherwise FormSubmit.
 * Deploy: supabase functions deploy contact-form --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const CONTACT_TO = Deno.env.get('CONTACT_TO') ?? 'contact@techtostore.com';

function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  let allow: string;
  if (ALLOWED_ORIGINS.length === 0) {
    allow = '*';
  } else if (ALLOWED_ORIGINS.includes(origin)) {
    allow = origin;
  } else {
    allow = ALLOWED_ORIGINS[0];
  }
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(body: Record<string, unknown>, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

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
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

type Body = {
  name?: string;
  phone?: string;
  email?: string;
  businessName?: string;
  message?: string;
  captchaToken?: string;
};

function buildEmailText(fields: {
  name: string;
  phone: string;
  email: string;
  businessName: string;
  message: string;
}): string {
  return [
    'New message from the Tech to Store website contact form.',
    '',
    `Name: ${fields.name}`,
    `Phone: ${fields.phone}`,
    `Email: ${fields.email}`,
    `Business name: ${fields.businessName || '(not provided)'}`,
    '',
    'Message:',
    fields.message,
    '',
    `— sent ${new Date().toISOString()}`,
  ].join('\n');
}

async function sendViaSmtp(fields: {
  name: string;
  phone: string;
  email: string;
  businessName: string;
  message: string;
  subject: string;
}): Promise<void> {
  const smtpHost = Deno.env.get('SMTP_HOST') ?? 'mail.privateemail.com';
  const smtpPort = Number(Deno.env.get('SMTP_PORT') ?? '465');
  const smtpUser = Deno.env.get('SMTP_USER') ?? '';
  const smtpPass = Deno.env.get('SMTP_PASS') ?? '';
  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP not configured');
  }

  const client = new SMTPClient({
    connection: {
      hostname: smtpHost,
      port: smtpPort,
      tls: true,
      auth: {
        username: smtpUser,
        password: smtpPass,
      },
    },
  });

  await client.send({
    from: smtpUser,
    to: CONTACT_TO,
    replyTo: fields.email,
    subject: fields.subject,
    content: buildEmailText(fields),
  });
  await client.close();
}

/** Delivers to CONTACT_TO without requiring mailbox SMTP credentials. */
async function sendViaFormSubmit(fields: {
  name: string;
  phone: string;
  email: string;
  businessName: string;
  message: string;
  subject: string;
}): Promise<void> {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_TO)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: fields.name,
      phone: fields.phone,
      email: fields.email,
      business_name: fields.businessName || '(not provided)',
      message: fields.message,
      _subject: fields.subject,
      _template: 'table',
      _replyto: fields.email,
      _captcha: 'false',
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    success?: string | boolean;
    error?: string;
    message?: string;
  };

  if (!res.ok || data.error) {
    throw new Error(data.error || data.message || `FormSubmit failed (${res.status})`);
  }
}

serve(async (req) => {
  const cors = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405, cors);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400, cors);
  }

  const name = (body.name ?? '').trim();
  const phone = (body.phone ?? '').trim();
  const email = (body.email ?? '').trim().toLowerCase();
  const businessName = (body.businessName ?? '').trim();
  const message = (body.message ?? '').trim();

  if (!name || name.length > 120) {
    return json({ ok: false, error: 'Please enter your name.' }, 400, cors);
  }
  if (!phone || phone.length > 40) {
    return json({ ok: false, error: 'Please enter a phone number.' }, 400, cors);
  }
  if (!isPlausibleEmail(email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400, cors);
  }
  if (businessName.length > 160) {
    return json({ ok: false, error: 'Business name is too long.' }, 400, cors);
  }
  if (!message || message.length < 10 || message.length > 5000) {
    return json(
      { ok: false, error: 'Please write a message (at least 10 characters).' },
      400,
      cors,
    );
  }

  const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (turnstileSecret) {
    const token = (body.captchaToken ?? '').trim();
    if (!token) {
      return json({ ok: false, error: 'Complete the verification below.' }, 400, cors);
    }
    const ip = req.headers.get('cf-connecting-ip') ?? undefined;
    const ok = await verifyTurnstile(token, turnstileSecret, ip);
    if (!ok) {
      return json({ ok: false, error: 'Verification failed. Please try again.' }, 400, cors);
    }
  }

  const subject = businessName
    ? `Website inquiry from ${name} (${businessName})`
    : `Website inquiry from ${name}`;

  const fields = { name, phone, email, businessName, message, subject };

  try {
    const hasSmtp = Boolean(Deno.env.get('SMTP_USER') && Deno.env.get('SMTP_PASS'));
    if (hasSmtp) {
      await sendViaSmtp(fields);
    } else {
      await sendViaFormSubmit(fields);
    }
  } catch (err) {
    console.error('contact-form delivery error', err);
    return json(
      {
        ok: false,
        error:
          'Could not send your message. Please try again or email contact@techtostore.com directly.',
      },
      502,
      cors,
    );
  }

  return json({ ok: true }, 200, cors);
});
