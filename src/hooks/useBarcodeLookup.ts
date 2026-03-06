import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type LookupResult = {
  name: string;
  brand?: string;
  imageUrl?: string;
  categories?: string;
};

export function useBarcodeLookup(organizationId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkExisting = useCallback(
    async (barcode: string) => {
      const { data } = await supabase
        .from('products')
        .select('id, name')
        .eq('organization_id', organizationId)
        .or(`barcode.eq.${barcode},sku.eq.${barcode}`)
        .maybeSingle();
      return data;
    },
    [organizationId]
  );

  const lookupFromAPI = useCallback(async (barcode: string): Promise<LookupResult | null> => {
    try {
      const res = await fetch(
        `https://world.openfoodfacts.net/api/v2/product/${barcode}.json`
      );
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
      return null;
    }
  }, []);

  const lookup = useCallback(
    async (barcode: string) => {
      setLoading(true);
      setError(null);

      const existing = await checkExisting(barcode);
      if (existing) {
        setLoading(false);
        return { existing, lookup: null };
      }

      const lookupData = await lookupFromAPI(barcode);
      setLoading(false);
      return { existing: null, lookup: lookupData };
    },
    [checkExisting, lookupFromAPI]
  );

  return { lookup, loading, error };
}
