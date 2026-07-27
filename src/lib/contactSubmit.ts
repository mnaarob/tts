const CONTACT_TO = 'contact@techtostore.com';

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

  // 1) Same-origin API (SMTP / Web3Forms when configured on Vercel) — best for phones
  try {
    const { res, data } = await postJson('/api/contact', apiBody);
    if (res.ok && data.ok) return { ok: true };

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

    if (res.ok && !formFailed(data)) return { ok: true };

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

    if (res.ok && !formFailed(data)) return { ok: true };

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
