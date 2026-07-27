const CONTACT_TO = 'contact@techtostore.com';

const CLIENT_RATE_KEY = 'tts_contact_sends';
const CLIENT_RATE_WINDOW_MS = 60 * 60 * 1000;
const CLIENT_RATE_MAX = 4;

export type ContactPayload = {
  name: string;
  phone: string;
  email: string;
  businessName: string;
  message: string;
};

type SubmitResult = { ok: true } | { ok: false; error: string };

function formFailed(data: {
  success?: string | boolean;
  error?: string;
  message?: string;
}): boolean {
  return Boolean(
    data.error || data.success === false || data.success === 'false',
  );
}

function activationOrDetail(detail: string): string {
  if (/activat/i.test(detail)) {
    return 'Email delivery needs a one-time activation — use https://www.techtostore.com and check contact@techtostore.com for the FormSubmit link.';
  }
  return (
    detail ||
    'Could not send your message. Please email contact@techtostore.com directly.'
  );
}

function readClientHits(): number[] {
  try {
    const raw = localStorage.getItem(CLIENT_RATE_KEY);
    const parsed = raw ? (JSON.parse(raw) as number[]) : [];
    const now = Date.now();
    return parsed.filter((t) => now - t < CLIENT_RATE_WINDOW_MS);
  } catch {
    return [];
  }
}

function checkClientRateLimit(): SubmitResult | null {
  if (typeof localStorage === 'undefined') return null;
  const hits = readClientHits();
  if (hits.length >= CLIENT_RATE_MAX) {
    return {
      ok: false,
      error: 'Too many messages from this device. Please try again in an hour.',
    };
  }
  const last = hits[hits.length - 1];
  if (last && Date.now() - last < 45_000) {
    return {
      ok: false,
      error: 'Please wait a moment before sending another message.',
    };
  }
  return null;
}

function recordClientHit() {
  if (typeof localStorage === 'undefined') return;
  try {
    const hits = readClientHits();
    hits.push(Date.now());
    localStorage.setItem(CLIENT_RATE_KEY, JSON.stringify(hits));
  } catch {
    // private mode / blocked storage
  }
}

async function postJson(
  url: string,
  body: Record<string, unknown>,
): Promise<{
  res: Response;
  data: {
    ok?: boolean;
    success?: string | boolean;
    error?: string;
    message?: string;
    code?: string;
  };
}> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
    credentials: 'omit',
    mode: 'cors',
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    success?: string | boolean;
    error?: string;
    message?: string;
    code?: string;
  };
  return { res, data };
}

/** FormSubmit via urlencoded body — often less blocked on mobile than JSON. */
async function postFormSubmitUrlEncoded(fields: Record<string, string>) {
  const body = new URLSearchParams(fields);
  const res = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_TO)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body,
      credentials: 'omit',
      mode: 'cors',
    },
  );
  const data = (await res.json().catch(() => ({}))) as {
    success?: string | boolean;
    error?: string;
    message?: string;
  };
  return { res, data };
}

/**
 * Deliver contact form. Never reports success unless a provider confirms it.
 * Mobile phones often block FormSubmit JSON fetch — try urlencoded + same-origin API.
 */
export async function submitContactForm(
  payload: ContactPayload,
  captchaToken?: string,
): Promise<SubmitResult> {
  const name = payload.name.trim();
  const phone = payload.phone.trim();
  const email = payload.email.trim();
  const businessName = payload.businessName.trim();
  const message = payload.message.trim();

  const subject = businessName
    ? `Website inquiry from ${name} (${businessName})`
    : `Website inquiry from ${name}`;

  const apiBody = {
    name,
    phone,
    email,
    businessName,
    message,
    captchaToken,
  };

  let lastError = '';

  const clientBlocked = checkClientRateLimit();
  if (clientBlocked) return clientBlocked;

  // 1) Same-origin API (SMTP / Web3Forms when configured on Vercel) — best for phones
  try {
    const { res, data } = await postJson('/api/contact', apiBody);
    if (res.ok && data.ok) {
      recordClientHit();
      return { ok: true };
    }

    // Do not fall through when rate-limited — FormSubmit would bypass the limit
    if (res.status === 429 || data.code === 'RATE_LIMIT') {
      return {
        ok: false,
        error: activationOrDetail(
          data.error ||
            'Too many messages. Please try again in an hour.',
        ),
      };
    }

    if (data.code !== 'NO_SERVER_MAIL' && res.status !== 404) {
      if (res.status >= 400 && res.status < 500) {
        return {
          ok: false,
          error: activationOrDetail(data.error || data.message || ''),
        };
      }
      lastError = activationOrDetail(data.error || data.message || '');
    }
  } catch {
    // Vite local has no /api
  }

  // 2) FormSubmit JSON (works on most desktop browsers)
  try {
    const { res, data } = await postJson(
      `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_TO)}`,
      {
        name,
        phone,
        email,
        business_name: businessName || '(not provided)',
        message,
        _subject: subject,
        _template: 'table',
        _replyto: email,
        _captcha: 'false',
      },
    );

    if (res.ok && !formFailed(data)) {
      recordClientHit();
      return { ok: true };
    }

    lastError = activationOrDetail(data.error || data.message || '');
    if (/activat/i.test(data.message || data.error || '')) {
      return { ok: false, error: lastError };
    }
  } catch {
    // blocked on some phones
  }

  // 3) FormSubmit urlencoded — alternate path for mobile Safari / content blockers
  try {
    const { res, data } = await postFormSubmitUrlEncoded({
      name,
      phone,
      email,
      business_name: businessName || '(not provided)',
      message,
      _subject: subject,
      _template: 'table',
      _replyto: email,
      _captcha: 'false',
    });

    if (res.ok && !formFailed(data)) {
      recordClientHit();
      return { ok: true };
    }

    lastError = activationOrDetail(data.error || data.message || '');
    if (/activat/i.test(data.message || data.error || '')) {
      return { ok: false, error: lastError };
    }
  } catch {
    // ignore
  }

  return {
    ok: false,
    error:
      lastError ||
      'Could not send your message. Please email contact@techtostore.com directly.',
  };
}
