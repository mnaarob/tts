const CONTACT_TO = 'contact@techtostore.com';

export type ContactPayload = {
  name: string;
  phone: string;
  email: string;
  businessName: string;
  message: string;
};

/**
 * Deliver contact form to CONTACT_TO.
 * Prefers the Supabase `contact-form` edge function (SMTP / FormSubmit server-side).
 * Falls back to FormSubmit from the browser if the function is not deployed yet.
 */
export async function submitContactForm(
  payload: ContactPayload,
  captchaToken?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = payload.name.trim();
  const phone = payload.phone.trim();
  const email = payload.email.trim();
  const businessName = payload.businessName.trim();
  const message = payload.message.trim();

  // 1) Edge function when available
  try {
    const { supabase } = await import('./supabase');
    const { data, error } = await supabase.functions.invoke('contact-form', {
      body: {
        name,
        phone,
        email,
        businessName,
        message,
        captchaToken,
      },
    });

    if (!error) {
      const payloadRes = data as { ok?: boolean; error?: string } | null;
      if (payloadRes?.ok) return { ok: true };
      if (payloadRes?.error) return { ok: false, error: payloadRes.error };
    } else {
      const msg = error.message || '';
      // Only fall through for missing / unreachable function
      const missing =
        /Failed to send a request|not found|404|FunctionsFetchError/i.test(msg);
      if (!missing) {
        return { ok: false, error: msg || 'Could not send your message.' };
      }
    }
  } catch {
    // fall through to FormSubmit
  }

  // 2) Direct FormSubmit → Namecheap inbox (no edge deploy required)
  try {
    const subject = businessName
      ? `Website inquiry from ${name} (${businessName})`
      : `Website inquiry from ${name}`;

    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_TO)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          business_name: businessName || '(not provided)',
          message,
          _subject: subject,
          _template: 'table',
          _replyto: email,
          _captcha: 'false',
        }),
      },
    );

    const data = (await res.json().catch(() => ({}))) as {
      success?: string | boolean;
      error?: string;
      message?: string;
    };

    if (!res.ok || data.error) {
      return {
        ok: false,
        error:
          data.error ||
          data.message ||
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
