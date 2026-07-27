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
  };
  contentType: string;
}> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  const contentType = res.headers.get('content-type') || '';
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    success?: string | boolean;
    error?: string;
    message?: string;
  };
  return { res, data, contentType };
}

function activationOrDetail(detail: string): string {
  if (/activat/i.test(detail)) {
    return 'Email delivery is almost ready — check contact@techtostore.com for a FormSubmit activation link, click it once, then try again.';
  }
  return (
    detail ||
    'Could not send your message. Please email contact@techtostore.com directly.'
  );
}

/**
 * Deliver contact form to CONTACT_TO.
 * Order: same-origin Vercel `/api/contact` → Supabase edge → FormSubmit browser fallback.
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
  const body = {
    name,
    phone,
    email,
    businessName,
    message,
    captchaToken,
  };

  let lastError = '';

  // 1) Same-origin API on Vercel production (and preview)
  try {
    const { res, data, contentType } = await postJson('/api/contact', body);
    if (res.ok && data.ok) return { ok: true };

    const isJson = contentType.includes('application/json');
    // Local Vite has no /api — skip. Validation errors (4xx) should surface.
    if (isJson && res.status >= 400 && res.status < 500) {
      return {
        ok: false,
        error: activationOrDetail(data.error || data.message || ''),
      };
    }
    if (isJson && res.status >= 500) {
      lastError = activationOrDetail(data.error || data.message || '');
      // fall through — server FormSubmit often blocked from datacenter IPs
    }
  } catch {
    // fall through (local Vite has no /api route)
  }

  // 2) Supabase edge function when deployed
  try {
    const { supabase } = await import('./supabase');
    const { data, error } = await supabase.functions.invoke('contact-form', {
      body,
    });

    if (!error) {
      const payloadRes = data as { ok?: boolean; error?: string } | null;
      if (payloadRes?.ok) return { ok: true };
      if (payloadRes?.error) {
        lastError = payloadRes.error;
        // validation-style messages should stop; delivery failures fall through
        if (/please enter|verification|complete the/i.test(payloadRes.error)) {
          return { ok: false, error: payloadRes.error };
        }
      }
    } else {
      const msg = error.message || '';
      const missing =
        /Failed to send a request|not found|404|FunctionsFetchError|non-2xx/i.test(
          msg,
        );
      if (!missing) lastError = msg;
    }
  } catch {
    // fall through to FormSubmit
  }

  // 3) Direct FormSubmit from the browser (works after one-time email activation)
  try {
    const subject = businessName
      ? `Website inquiry from ${name} (${businessName})`
      : `Website inquiry from ${name}`;

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

    if (!res.ok || formFailed(data)) {
      return {
        ok: false,
        error: activationOrDetail(
          data.error || data.message || lastError || '',
        ),
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        lastError ||
        'Could not send your message. Please email contact@techtostore.com directly.',
    };
  }
}
