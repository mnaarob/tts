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
      setError(null);

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

      let storeName: string | null = null;
      let storeOrganizationId: string | null = null;
      if (saRes.data?.store_id) {
        const { data: store } = await supabase
          .from('stores')
          .select('name, organization_id')
          .eq('id', saRes.data.store_id)
          .maybeSingle();
        storeName = store?.name ?? null;
        storeOrganizationId = store?.organization_id ?? null;
      }

      if (orgRes.error) {
        setError(orgRes.error.message);
        setOrganization(null);
        setLoading(false);
        return;
      }

      // Owner: inventory org row exists; prefer store display name when linked
      if (orgRes.data) {
        setOrganization({
          id: orgRes.data.id,
          name: storeName ?? orgRes.data.name,
          owner_id: orgRes.data.owner_id,
        });
        setLoading(false);
        return;
      }

      // Team member (or owner without org row): same inventory UUID as products via stores.organization_id
      if (storeOrganizationId && storeName) {
        const { data: orgRow } = await supabase
          .from('organizations')
          .select('owner_id')
          .eq('id', storeOrganizationId)
          .maybeSingle();

        setOrganization({
          id: storeOrganizationId,
          name: storeName,
          owner_id: orgRow?.owner_id ?? user!.id,
        });
        setLoading(false);
        return;
      }

      // Legacy: store row exists but organization_id not set yet (run migration 006)
      if (saRes.data?.store_id && storeName && !storeOrganizationId) {
        setOrganization(null);
        setLoading(false);
        return;
      }

      setOrganization(null);
      setLoading(false);
    }

    fetchOrg();
  }, [user]);

  return { organization, loading, error };
}
