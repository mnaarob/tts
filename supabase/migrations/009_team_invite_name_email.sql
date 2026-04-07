-- Manager-provided name + email on invites; display_name on members; email-bound signup.

ALTER TABLE store_invites ADD COLUMN IF NOT EXISTS full_name text;

ALTER TABLE store_admins ADD COLUMN IF NOT EXISTS display_name text;

CREATE UNIQUE INDEX IF NOT EXISTS store_invites_store_email_lower_nonempty_idx
  ON store_invites (store_id, lower(trim(email)))
  WHERE email IS NOT NULL AND trim(email) <> '';

CREATE OR REPLACE FUNCTION get_store_team(p_store_id text)
RETURNS TABLE (
  user_id     uuid,
  email       text,
  full_name   text,
  role        text,
  employee_id char(6),
  joined_at   timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sa.user_id,
    au.email,
    COALESCE(
      sa.display_name,
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      au.email
    ) AS full_name,
    sa.role,
    sa.employee_id,
    au.created_at AS joined_at
  FROM store_admins sa
  JOIN auth.users au ON sa.user_id = au.id
  WHERE sa.store_id = p_store_id
    AND EXISTS (
      SELECT 1 FROM store_admins
      WHERE user_id = auth.uid()
        AND store_id = p_store_id
    )
  ORDER BY au.created_at;
$$;
