import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { sanitizeBarcode } from '../lib/sanitize';

export type LookupResult = {
  name: string;
  brand?: string;
  imageUrl?: string;
  categories?: string;
};

/** Cap on how long the OpenFoodFacts request is allowed to run. */
const LOOKUP_TIMEOUT_MS = 4000;

/**
 * Run an external product API lookup with a hard timeout.
 *
 * Resolves to `null` (never throws) so the calling UI can decide on its own
 * whether the absence of a result matters. Exported standalone so that the
 * inventory dashboard can call it from a fire-and-forget background path
 * without going through the hook's loading state.
 */
export async function lookupProductFromApi(
  barcode: string,
  signal?: AbortSignal,
): Promise<LookupResult | null> {
  const safe = sanitizeBarcode(barcode);
  if (!safe) return null;

  // If the caller already aborted, bail straight away.
  if (signal?.aborted) return null;

  const ctrl = new AbortController();
  const onCallerAbort = () => ctrl.abort();
  signal?.addEventListener('abort', onCallerAbort, { once: true });
  const timeoutId = setTimeout(() => ctrl.abort(), LOOKUP_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://world.openfoodfacts.net/api/v2/product/${encodeURIComponent(safe)}.json`,
      { signal: ctrl.signal },
    );
    if (!res.ok) return null;
    const data = await res.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      return {
        name: p.product_name || p.product_name_en || 'Unknown Product',
        brand: p.brands,
        imageUrl: p.image_url || p.image_front_url,
        categories: p.categories?.replace(/,/g, ' > ') || p.categories_tags?.[0],
      };
    }
    return null;
  } catch {
    // AbortError, network error, JSON parse error — all treated as "no info".
    return null;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onCallerAbort);
  }
}

export function useBarcodeLookup(organizationId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkExisting = useCallback(
    async (barcode: string) => {
      // PostgREST `or(...)` separates filters with commas. Anything other than
      // [A-Za-z0-9-] in the barcode could smuggle additional filters and
      // bypass the `organization_id` constraint, so reject it outright.
      const safe = sanitizeBarcode(barcode);
      if (!safe) return null;

      const { data } = await supabase
        .from('products')
        .select('id, name')
        .eq('organization_id', organizationId)
        .or(`barcode.eq.${safe},sku.eq.${safe}`)
        .maybeSingle();
      return data;
    },
    [organizationId]
  );

  const lookupFromAPI = useCallback(
    (barcode: string, signal?: AbortSignal) => lookupProductFromApi(barcode, signal),
    [],
  );

  const lookup = useCallback(
    async (barcode: string, signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      const safe = sanitizeBarcode(barcode);
      if (!safe) {
        setLoading(false);
        setError('Barcode must be 6–32 letters, digits, or dashes.');
        return { existing: null, lookup: null };
      }

      const existing = await checkExisting(safe);
      if (existing) {
        setLoading(false);
        return { existing, lookup: null };
      }

      const lookupData = await lookupFromAPI(safe, signal);
      setLoading(false);
      return { existing: null, lookup: lookupData };
    },
    [checkExisting, lookupFromAPI]
  );

  return { lookup, lookupFromAPI, checkExisting, loading, error };
}
