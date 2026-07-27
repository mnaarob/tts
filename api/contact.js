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

  const text = await res.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    const err = new Error(
      `FormSubmit returned non-JSON (${res.status}): ${text.slice(0, 180)}`,
    );
    err.code = 'FORMSUBMIT';
    throw err;
  }

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

/** Minimal SMTP over TLS for Namecheap Private Email (port 465). */
async function sendViaSmtp(fields) {
  const net = await import('node:tls');
  const host = process.env.SMTP_HOST || 'mail.privateemail.com';
  const port = Number(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  if (!user || !pass) throw new Error('SMTP not configured');

  const from = user;
  const to = CONTACT_TO;
  const subject = fields.subject;
  const content = [
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
  ].join('\r\n');

  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
  const data = [
    `From: ${from}`,
    `To: ${to}`,
    `Reply-To: ${fields.email}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    content,
    '',
  ].join('\r\n');

  await new Promise((resolve, reject) => {
    const socket = net.connect({ host, port, servername: host }, async () => {
      const write = (line) =>
        new Promise((resWrite, rejWrite) => {
          socket.write(line + '\r\n', (err) => (err ? rejWrite(err) : resWrite()));
        });

      let buf = '';
      const readCode = () =>
        new Promise((resRead, rejRead) => {
          const onData = (chunk) => {
            buf += chunk.toString('utf8');
            const lines = buf.split(/\r?\n/).filter(Boolean);
            const last = lines[lines.length - 1] || '';
            if (/^\d{3}[\s-]/.test(last) && !/^\d{3}-/.test(last)) {
              socket.off('data', onData);
              const code = Number(last.slice(0, 3));
              resRead({ code, last, buf });
              buf = '';
            }
          };
          socket.on('data', onData);
          socket.on('error', rejRead);
        });

      (async () => {
        try {
          let r = await readCode();
          if (r.code !== 220) throw new Error(`SMTP greeting failed: ${r.last}`);

          await write(`EHLO techtostore.com`);
          r = await readCode();
          if (r.code !== 250) throw new Error(`EHLO failed: ${r.last}`);

          await write('AUTH LOGIN');
          r = await readCode();
          if (r.code !== 334) throw new Error(`AUTH LOGIN failed: ${r.last}`);

          await write(Buffer.from(user, 'utf8').toString('base64'));
          r = await readCode();
          if (r.code !== 334) throw new Error(`SMTP user rejected: ${r.last}`);

          await write(Buffer.from(pass, 'utf8').toString('base64'));
          r = await readCode();
          if (r.code !== 235) throw new Error(`SMTP auth failed: ${r.last}`);

          await write(`MAIL FROM:<${from}>`);
          r = await readCode();
          if (r.code !== 250) throw new Error(`MAIL FROM failed: ${r.last}`);

          await write(`RCPT TO:<${to}>`);
          r = await readCode();
          if (r.code !== 250) throw new Error(`RCPT TO failed: ${r.last}`);

          await write('DATA');
          r = await readCode();
          if (r.code !== 354) throw new Error(`DATA failed: ${r.last}`);

          await write(data.replace(/^\./gm, '..') + '\r\n.');
          r = await readCode();
          if (r.code !== 250) throw new Error(`Message rejected: ${r.last}`);

          await write('QUIT');
          socket.end();
          resolve();
        } catch (err) {
          socket.destroy();
          reject(err);
        }
      })();
    });

    socket.setTimeout(20000, () => {
      socket.destroy();
      reject(new Error('SMTP connection timed out'));
    });
    socket.on('error', reject);
  });
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
      String(req.headers['x-forwarded-for'] || '')
        .split(',')[0]
        .trim() || req.socket?.remoteAddress;
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
    const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    if (hasSmtp) {
      await sendViaSmtp(fields);
    } else {
      await sendViaFormSubmit(fields);
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    const messageText = err?.message || 'Could not send your message.';
    console.error('api/contact delivery error', messageText);
    if (err?.code === 'NEEDS_ACTIVATION' || /activat/i.test(messageText)) {
      res.status(503).json({
        ok: false,
        error:
          'Email delivery is almost ready — check contact@techtostore.com for a FormSubmit activation link, click it once, then try again.',
      });
      return;
    }
    res.status(502).json({
      ok: false,
      error: messageText.includes('SMTP')
        ? 'Email server rejected the message. Please email contact@techtostore.com directly.'
        : 'Could not send your message. Please email contact@techtostore.com directly.',
      detail: messageText.slice(0, 240),
    });
  }
}
