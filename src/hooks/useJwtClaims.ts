import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type StoreRole = 'owner' | 'manager' | 'staff';

export type JwtClaims = {
  store_id: string;
  store_role: StoreRole;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function useJwtClaims(): JwtClaims | null {
  const { session, user } = useAuth();
  const [dbClaims, setDbClaims] = useState<JwtClaims | null>(null);

  // Try to read claims from JWT (only present if Supabase custom JWT hook is configured)
  const jwtClaims = useMemo(() => {
    if (!session?.access_token) return null;
    const payload = decodeJwtPayload(session.access_token);
    if (!payload) return null;
    const store_id = payload.store_id as string | undefined;
    const store_role = payload.store_role as StoreRole | undefined;
    if (!store_id || !store_role) return null;
    return { store_id, store_role };
  }, [session?.access_token]);

  // Fall back to querying store_admins directly.
  // Depends only on user.id — not on jwtClaims — so token refreshes don't
  // cause a flicker where the Team tab briefly disappears.
  useEffect(() => {
    if (!user?.id) {
      setDbClaims(null);
      return;
    }

    supabase
      .from('store_admins')
      .select('store_id, role')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.store_id && data?.role) {
          setDbClaims({ store_id: data.store_id, store_role: data.role as StoreRole });
        } else {
          setDbClaims(null);
        }
      });
  }, [user?.id]);

  return jwtClaims ?? dbClaims;
}

// Standalone decoder — usable outside React (e.g. in ProtectedRoute)
export function decodeJwt(token: string): JwtClaims | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const store_id = payload.store_id as string | undefined;
  const store_role = payload.store_role as StoreRole | undefined;
  if (!store_id || !store_role) return null;
  return { store_id, store_role };
}
