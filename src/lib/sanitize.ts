/**
 * Input sanitization helpers used to defend against PostgREST filter
 * injection (e.g. via `or(...)`, `ilike(...)`) and to keep barcode-style
 * inputs to a known, narrow alphabet.
 */

/** Allowed barcode chars: digits, latin letters, dash. 6–32 long. */
export const BARCODE_REGEX = /^[A-Za-z0-9-]{6,32}$/;

export function isValidBarcode(value: string | null | undefined): boolean {
  if (!value) return false;
  return BARCODE_REGEX.test(value.trim());
}

/**
 * Returns a barcode if it is valid, else null. Strips whitespace.
 * Use this anywhere a scanned/typed barcode is sent to the database
 * inside a PostgREST filter expression.
 */
export function sanitizeBarcode(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return BARCODE_REGEX.test(trimmed) ? trimmed : null;
}

/**
 * Escape a string for safe use inside a PostgREST `ilike`/`like` pattern.
 * `%` and `_` are wildcards — left unescaped a value of `"%"` matches every
 * row in the table.
 */
export function escapeLikePattern(value: string): string {
  return value.replace(/([\\%_])/g, '\\$1');
}
