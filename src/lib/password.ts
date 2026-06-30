/**
 * Single source of truth for the user-facing password policy.
 *
 * NIST SP 800-63B recommends a minimum of 8 characters for memorized
 * secrets, no forced complexity, and a check against known compromised
 * passwords. Length checks here run client-side as UX guardrails;
 * Supabase Auth enforces real validation server-side and (when enabled
 * in the Auth dashboard) blocks passwords leaked in HIBP.
 */

export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_HELP_TEXT = `At least ${MIN_PASSWORD_LENGTH} characters. Avoid common or reused passwords.`;

export type PasswordCheck = { ok: true } | { ok: false; reason: string };

export function checkPassword(password: string): PasswordCheck {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, reason: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  // Block obvious low-entropy passwords. Supabase HIBP integration handles
  // the long tail of leaked credentials when enabled in the Auth dashboard.
  const lower = password.toLowerCase();
  const banned = [
    'password',
    '12345678',
    'qwerty12',
    'iloveyou',
    'letmein',
    'admin123',
    'welcome1',
  ];
  if (banned.some((b) => lower === b || lower.startsWith(b))) {
    return { ok: false, reason: 'This password is too common. Choose something less guessable.' };
  }
  return { ok: true };
}
