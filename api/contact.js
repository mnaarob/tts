const CONTACT_TO = process.env.CONTACT_TO || 'contact@techtostore.com';

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

async function sendViaFormSubmit(fields) {
  const res = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_TO)}`,
    {
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
    },
  );

  const data = await res.json().catch(() => ({}));
  const failed =
    !res.ok ||
    data.error ||
    data.success === false ||
    data.success === 'false';

  if (failed) {
    const msg =
      data.message ||
      data.error ||
      `FormSubmit failed (${res.status})`;
    const err = new Error(msg);
    err.code = /activat/i.test(msg) ? 'NEEDS_ACTIVATION' : 'FORMSUBMIT';
    throw err;
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

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const businessName = String(body.businessName || '').trim();
  const message = String(body.message || '').trim();
  const captchaToken = String(body.captchaToken || '').trim();

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

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!captchaToken) {
      res.status(400).json({ ok: false, error: 'Complete the verification below.' });
      return;
    }
    const ip =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket?.remoteAddress;
    const ok = await verifyTurnstile(captchaToken, turnstileSecret, ip);
    if (!ok) {
      res.status(400).json({ ok: false, error: 'Verification failed. Please try again.' });
      return;
    }
  }

  const subject = businessName
    ? `Website inquiry from ${name} (${businessName})`
    : `Website inquiry from ${name}`;

  try {
    await sendViaFormSubmit({
      name,
      phone,
      email,
      businessName,
      message,
      subject,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    const messageText = err?.message || 'Could not send your message.';
    if (err?.code === 'NEEDS_ACTIVATION' || /activat/i.test(messageText)) {
      res.status(503).json({
        ok: false,
        error:
          'Email delivery is almost ready — check contact@techtostore.com for a FormSubmit activation link, click it once, then try again.',
      });
      return;
    }
    console.error('api/contact delivery error', err);
    res.status(502).json({
      ok: false,
      error:
        'Could not send your message. Please email contact@techtostore.com directly.',
    });
  }
}
