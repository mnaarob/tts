-- Remove a team member from a store.
-- Only owners/managers of the same store can remove non-owner members.
-- Uses SECURITY DEFINER to bypass RLS on store_admins.

CREATE OR REPLACE FUNCTION remove_store_member(p_store_id text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  target_role text;
BEGIN
  SELECT role INTO caller_role
  FROM store_admins
  WHERE store_id = p_store_id AND user_id = auth.uid();

  IF caller_role IS NULL OR caller_role NOT IN ('owner', 'manager') THEN
    RETURN false;
  END IF;

  SELECT role INTO target_role
  FROM store_admins
  WHERE store_id = p_store_id AND user_id = p_user_id;

  IF target_role IS NULL OR target_role = 'owner' THEN
    RETURN false;
  END IF;

  DELETE FROM store_admins
  WHERE store_id = p_store_id AND user_id = p_user_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION remove_store_member(text, uuid) TO authenticated;
