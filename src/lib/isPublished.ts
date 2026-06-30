/**
 * Normalizes `products.is_published` from PostgREST/JSON (boolean, null, or occasional string).
 */
export function parseIsPublished(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (value == null) return false;
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    return s === 'true' || s === 't' || s === '1' || s === 'yes';
  }
  return Boolean(value);
}
