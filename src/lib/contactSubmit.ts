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
): Promise<{ res: Response; data: { ok?: boolean; success?: string | boolean; error?: string; message?: string } }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    success?: string | boolean;
    error?: string;
    message?: string;
  };
  return { res, data };
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

  // 1) Same-origin API on Vercel production (and preview)
  try {
    const { res, data } = await postJson('/api/contact', body);
    // Vite local has no /api — treat HTML/404 as skip
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && data.ok) return { ok: true };
    if (res.status !== 404 && contentType.includes('application/json')) {
      return {
        ok: false,
        error:
          data.error ||
          data.message ||
          'Could not send your message. Please email contact@techtostore.com directly.',
      };
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
      if (payloadRes?.error) return { ok: false, error: payloadRes.error };
    } else {
      const msg = error.message || '';
      const missing =
        /Failed to send a request|not found|404|FunctionsFetchError|non-2xx/i.test(
          msg,
        );
      if (!missing) {
        return { ok: false, error: msg || 'Could not send your message.' };
      }
    }
  } catch {
    // fall through to FormSubmit
  }

  // 3) Direct FormSubmit from the browser
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
      const detail = data.error || data.message || '';
      if (/activat/i.test(detail)) {
        return {
          ok: false,
          error:
            'Email delivery is almost ready — check contact@techtostore.com for a FormSubmit activation link, click it once, then try again.',
        };
      }
      return {
        ok: false,
        error:
          detail ||
          'Could not send your message. Please email contact@techtostore.com directly.',
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        'Could not send your message. Please email contact@techtostore.com directly.',
    };
  }
}
