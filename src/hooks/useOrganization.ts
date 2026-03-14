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
      // Try new multi-tenant schema first: store_admins → stores
      const { data: sa } = await supabase
        .from('store_admins')
        .select('store_id, role')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (sa?.store_id) {
        const { data: store } = await supabase
          .from('stores')
          .select('id, name')
          .eq('id', sa.store_id)
          .maybeSingle();

        if (store) {
          setOrganization({ id: store.id, name: store.name, owner_id: user!.id });
          setLoading(false);
          return;
        }
      }

      // Fall back to legacy organizations table
      const { data, error: err } = await supabase
        .from('organizations')
        .select('id, name, owner_id')
        .eq('owner_id', user!.id)
        .maybeSingle();

      if (err) {
        setError(err.message);
        setOrganization(null);
      } else {
        setOrganization(data);
      }
      setLoading(false);
    }

    fetchOrg();
  }, [user]);

  return { organization, loading, error };
}
