-- Pending team invites: row exists until invitee sets password and completes onboarding.
-- store_admins is only inserted after accept (via complete-store-invite Edge Function).

CREATE TABLE IF NOT EXISTS store_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('manager', 'staff')),
  employee_id char(6) NOT NULL,
  invited_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS store_invites_store_email_lower_idx
  ON store_invites (store_id, lower(email));

ALTER TABLE store_invites ENABLE ROW LEVEL SECURITY;

-- Managers/owners can list and revoke invites for their store
CREATE POLICY "store_managers_select_invites"
  ON store_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM store_admins sa
      WHERE sa.store_id = store_invites.store_id
        AND sa.user_id = auth.uid()
        AND sa.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "store_managers_delete_invites"
  ON store_invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM store_admins sa
      WHERE sa.store_id = store_invites.store_id
        AND sa.user_id = auth.uid()
        AND sa.role IN ('owner', 'manager')
    )
  );
