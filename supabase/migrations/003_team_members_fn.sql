-- Returns all members of a store with their email, name, role, employee_id from auth.users.
-- SECURITY DEFINER allows joining auth.users (not accessible to anon/authenticated roles directly).
-- The EXISTS check ensures the caller is themselves a member of the requested store.
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
