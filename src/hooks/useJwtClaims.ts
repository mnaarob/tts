import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export type StoreRole = 'owner' | 'manager' | 'staff';

export type JwtClaims = {
  store_id: string;
  store_role: StoreRole;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    // Pad base64 string to a multiple of 4 characters
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function useJwtClaims(): JwtClaims | null {
  const { session } = useAuth();

  return useMemo(() => {
    if (!session?.access_token) return null;

    const payload = decodeJwtPayload(session.access_token);
    if (!payload) return null;

    const store_id = payload.store_id as string | undefined;
    const store_role = payload.store_role as StoreRole | undefined;

    if (!store_id || !store_role) return null;

    return { store_id, store_role };
  }, [session?.access_token]);
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
