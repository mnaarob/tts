/**
 * Tiny session-scoped store for an in-progress employee invite that the
 * user has to finish claiming after they sign in. We keep the data in
 * sessionStorage so it survives the redirect to /login but does NOT live
 * across browser restarts. AuthContext.signOut also clears sessionStorage,
 * so leftover invite intent never lingers between users on a shared device.
 */

const KEY = 'pending_employee_invite_v1';

export type PendingInvite = {
  store_name: string;
  employee_id: string;
};

export function setPendingInvite(invite: PendingInvite): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(invite));
  } catch {
    // Storage may be disabled (private mode); fail silently.
  }
}

export function getPendingInvite(): PendingInvite | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.store_name === 'string' &&
      typeof parsed.employee_id === 'string'
    ) {
      return { store_name: parsed.store_name, employee_id: parsed.employee_id };
    }
  } catch {
    // ignore
  }
  return null;
}

export function clearPendingInvite(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
