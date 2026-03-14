import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type Organization = {
  id: string;
  name: string;
  owner_id: string;
};

export function useOrganization() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    async function fetchOrg() {
      // Fetch both in parallel:
      // - organizations table: provides the UUID used by products/categories/stock
      // - store_admins → stores: provides the real store display name
      const [orgRes, saRes] = await Promise.all([
        supabase
          .from('organizations')
          .select('id, name, owner_id')
          .eq('owner_id', user!.id)
          .maybeSingle(),
        supabase
          .from('store_admins')
          .select('store_id')
          .eq('user_id', user!.id)
          .maybeSingle(),
      ]);

      // Try to get the real store name from the stores table
      let storeName: string | null = null;
      if (saRes.data?.store_id) {
        const { data: store } = await supabase
          .from('stores')
          .select('name')
          .eq('id', saRes.data.store_id)
          .maybeSingle();
        storeName = store?.name ?? null;
      }

      if (orgRes.error) {
        setError(orgRes.error.message);
        setOrganization(null);
      } else if (orgRes.data) {
        // Use the organization UUID for DB queries, but show the real store name
        setOrganization({
          id: orgRes.data.id,
          name: storeName ?? orgRes.data.name,
          owner_id: orgRes.data.owner_id,
        });
      } else if (saRes.data?.store_id && storeName) {
        // No organizations row yet — use the store directly
        setOrganization({
          id: saRes.data.store_id,
          name: storeName,
          owner_id: user!.id,
        });
      } else {
        setOrganization(null);
      }
      setLoading(false);
    }

    fetchOrg();
  }, [user]);

  return { organization, loading, error };
}
