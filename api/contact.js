import nodemailer from 'nodemailer';

const CONTACT_TO = process.env.CONTACT_TO || 'contact@techtostore.com';

/** Soft in-memory limits (per warm serverless instance). */
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX_PER_IP = 4;
const RATE_MAX_PER_EMAIL = 3;
const RATE_MIN_GAP_MS = 45 * 1000; // 45s between sends from same IP

/** @type {Map<string, number[]>} */
const hitsByKey = new Map();

function pruneAndCount(key, now, windowMs) {
  const prev = hitsByKey.get(key) || [];
  const next = prev.filter((t) => now - t < windowMs);
  hitsByKey.set(key, next);
  return next;
}

function checkRateLimit(ip, email) {
  const now = Date.now();
  const ipKey = `ip:${ip || 'unknown'}`;
  const emailKey = `email:${(email || '').toLowerCase()}`;

  const ipHits = pruneAndCount(ipKey, now, RATE_WINDOW_MS);
  if (ipHits.length >= RATE_MAX_PER_IP) {
    return {
      ok: false,
      error: 'Too many messages from this network. Please try again in an hour.',
    };
  }

  const lastIp = ipHits[ipHits.length - 1];
  if (lastIp && now - lastIp < RATE_MIN_GAP_MS) {
    return {
      ok: false,
      error: 'Please wait a moment before sending another message.',
    };
  }

  const emailHits = pruneAndCount(emailKey, now, RATE_WINDOW_MS);
  if (emailHits.length >= RATE_MAX_PER_EMAIL) {
    return {
      ok: false,
      error: 'Too many messages from this email. Please try again in an hour.',
    };
  }

  return { ok: true, ipKey, emailKey, now };
}

function recordRateHit(ipKey, emailKey, now) {
  const ipHits = hitsByKey.get(ipKey) || [];
  ipHits.push(now);
  hitsByKey.set(ipKey, ipHits);

  const emailHits = hitsByKey.get(emailKey) || [];
  emailHits.push(now);
  hitsByKey.set(emailKey, emailHits);
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function isPlausibleEmail(email) {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyTurnstile(token, secret, remoteIp) {
  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteIp) body.set('remoteip', remoteIp);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = await res.json();
  return Boolean(data?.success);
}

async function sendViaSmtp(fields) {
  const host = process.env.SMTP_HOST || 'mail.privateemail.com';
  const port = Number(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  if (!user || !pass) {
    const err = new Error('SMTP not configured');
    err.code = 'NO_SMTP';
    throw err;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const text = [
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

  await transporter.sendMail({
    from: `Tech to Store <${user}>`,
    to: CONTACT_TO,
    replyTo: fields.email,
    subject: fields.subject,
    text,
  });
}

async function sendViaWeb3Forms(fields) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY || '';
  if (!accessKey) {
    const err = new Error('WEB3FORMS not configured');
    err.code = 'NO_WEB3FORMS';
    throw err;
  }

  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: accessKey,
      subject: fields.subject,
      from_name: fields.name,
      email: fields.email,
      phone: fields.phone,
      business_name: fields.businessName || '(not provided)',
      message: fields.message,
      to: CONTACT_TO,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Web3Forms failed (${res.status})`);
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      res.status(400).json({ ok: false, error: 'Invalid JSON body' });
      return;
    }
  }
  body = body || {};

  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const businessName = String(body.businessName || '').trim();
  const message = String(body.message || '').trim();
  const captchaToken = String(body.captchaToken || '').trim();
  const ip = clientIp(req);

  if (!name || name.length > 120) {
    res.status(400).json({ ok: false, error: 'Please enter your name.' });
    return;
  }
  if (!phone || phone.length > 40) {
    res.status(400).json({ ok: false, error: 'Please enter a phone number.' });
    return;
  }
  if (!isPlausibleEmail(email)) {
    res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    return;
  }
  if (businessName.length > 160) {
    res.status(400).json({ ok: false, error: 'Business name is too long.' });
    return;
  }
  if (!message || message.length < 10 || message.length > 5000) {
    res.status(400).json({
      ok: false,
      error: 'Please write a message (at least 10 characters).',
    });
    return;
  }

  const rate = checkRateLimit(ip, email);
  if (!rate.ok) {
    res.status(429).json({ ok: false, error: rate.error, code: 'RATE_LIMIT' });
    return;
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!captchaToken) {
      res.status(400).json({ ok: false, error: 'Complete the verification below.' });
      return;
    }
    const ok = await verifyTurnstile(captchaToken, turnstileSecret, ip);
    if (!ok) {
      res.status(400).json({ ok: false, error: 'Verification failed. Please try again.' });
      return;
    }
  }

  const subject = businessName
    ? `Website inquiry from ${name} (${businessName})`
    : `Website inquiry from ${name}`;

  const fields = { name, phone, email, businessName, message, subject };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendViaSmtp(fields);
    } else if (process.env.WEB3FORMS_ACCESS_KEY) {
      await sendViaWeb3Forms(fields);
    } else {
      res.status(503).json({
        ok: false,
        error: 'Server email is not configured.',
        code: 'NO_SERVER_MAIL',
      });
      return;
    }
    recordRateHit(rate.ipKey, rate.emailKey, rate.now);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('api/contact delivery error', err?.message || err);
    res.status(502).json({
      ok: false,
      error:
        'Could not send your message. Please email contact@techtostore.com directly.',
    });
  }
}
