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
    // Avoid opaque failures on some mobile browsers / private modes
    credentials: 'omit',
    mode: 'cors',
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
    return 'Email delivery is almost ready — open this site as www.techtostore.com, check contact@techtostore.com for a FormSubmit activation link, click it once, then try again.';
  }
  return (
    detail ||
    'Could not send your message. Please email contact@techtostore.com directly.'
  );
}

/** Classic form POST — works on iOS when fetch to FormSubmit is blocked. */
function submitViaHiddenForm(fields: Record<string, string>): Promise<boolean> {
  return new Promise((resolve) => {
    const frameName = `contact_fs_${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = frameName;
    iframe.title = 'contact-submit';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://formsubmit.co/${encodeURIComponent(CONTACT_TO)}`;
    form.target = frameName;
    form.style.display = 'none';
    form.acceptCharset = 'UTF-8';

    const add = (name: string, value: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    Object.entries(fields).forEach(([k, v]) => add(k, v));
    add('_captcha', 'false');
    add('_template', 'table');
    // Stay on page; iframe receives the response
    add('_next', 'https://www.techtostore.com/#/contact?sent=1');

    document.body.appendChild(form);

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      iframe.removeEventListener('load', onLoad);
      form.remove();
      // Delay iframe removal so the POST can complete
      window.setTimeout(() => iframe.remove(), 1500);
      resolve(ok);
    };

    const onLoad = () => finish(true);
    iframe.addEventListener('load', onLoad);
    const timer = window.setTimeout(() => finish(true), 2500);

    try {
      form.submit();
    } catch {
      finish(false);
    }
  });
}

/**
 * Deliver contact form to CONTACT_TO.
 * Prefer browser FormSubmit (works for www), then same-origin API, then form POST fallback for mobile.
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

  const subject = businessName
    ? `Website inquiry from ${name} (${businessName})`
    : `Website inquiry from ${name}`;

  let lastError = '';

  // 1) Browser FormSubmit first — reliable on desktop/www once activated
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
    // Apex host often needs a separate FormSubmit activation — surface that clearly
    if (/activat/i.test(data.message || data.error || '')) {
      return { ok: false, error: lastError };
    }
  } catch {
    // Mobile browsers / content blockers often block this fetch — keep going
  }

  // 2) Same-origin Vercel API
  try {
    const { res, data, contentType } = await postJson('/api/contact', body);
    if (res.ok && data.ok) return { ok: true };

    const isJson = contentType.includes('application/json');
    if (isJson && res.status >= 400 && res.status < 500) {
      return {
        ok: false,
        error: activationOrDetail(data.error || data.message || ''),
      };
    }
    if (isJson && (data.error || data.message)) {
      lastError = activationOrDetail(data.error || data.message || '');
    }
  } catch {
    // local Vite / network
  }

  // 3) Supabase edge (if deployed)
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
        if (/please enter|verification|complete the|activat/i.test(payloadRes.error)) {
          return { ok: false, error: payloadRes.error };
        }
      }
    }
  } catch {
    // ignore
  }

  // 4) Hidden form POST — more reliable on iPhone Safari / content blockers
  if (typeof document !== 'undefined') {
    const ok = await submitViaHiddenForm({
      name,
      phone,
      email,
      business_name: businessName || '(not provided)',
      message,
      _subject: subject,
      _replyto: email,
    });
    if (ok) return { ok: true };
  }

  return {
    ok: false,
    error:
      lastError ||
      'Could not send your message. Please email contact@techtostore.com directly.',
  };
}
