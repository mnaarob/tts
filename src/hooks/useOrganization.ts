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

    async function fetchOrCreateOrg() {
      let { data, error: err } = await supabase
        .from('organizations')
        .select('id, name, owner_id')
        .eq('owner_id', user.id)
        .maybeSingle();

      // Create org if it doesn't exist (e.g. user signed up before we removed the trigger)
      if (!err && !data) {
        const storeName = user.user_metadata?.store_name || 'My Store';
        const { data: newOrg, error: insertErr } = await supabase
          .from('organizations')
          .insert({ name: storeName, owner_id: user.id })
          .select('id, name, owner_id')
          .single();

        if (!insertErr) {
          data = newOrg;
        } else {
          err = insertErr;
        }
      }

      if (err) {
        setError(err.message);
        setOrganization(null);
      } else {
        setOrganization(data);
      }
      setLoading(false);
    }

    fetchOrCreateOrg();
  }, [user]);

  return { organization, loading, error };
}
