-- Add employee_id to store_admins (6-char alphanumeric, unique per store)
ALTER TABLE store_admins
  ADD COLUMN IF NOT EXISTS employee_id char(6);

ALTER TABLE store_admins
  DROP CONSTRAINT IF EXISTS store_admins_employee_id_unique;

ALTER TABLE store_admins
  ADD CONSTRAINT store_admins_employee_id_unique UNIQUE (store_id, employee_id);

-- Validates that the currently logged-in user belongs to a store with the given
-- name and has the given employee_id. Called immediately after Supabase auth login.
-- Returns true = OK to proceed, false = reject and sign out.
CREATE OR REPLACE FUNCTION validate_employee_login(p_store_name text, p_employee_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM store_admins sa
    JOIN stores s ON sa.store_id = s.id
    WHERE sa.user_id = auth.uid()
      AND lower(s.name)        = lower(p_store_name)
      AND lower(sa.employee_id) = lower(p_employee_id)
  );
$$;

-- Generates a unique 6-char alphanumeric Employee ID for a given store.
-- Characters chosen to avoid visually ambiguous pairs (0/O, 1/I/L).
CREATE OR REPLACE FUNCTION generate_employee_id(p_store_id text)
RETURNS char(6)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars   text    := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result  char(6) := '';
  attempts int    := 0;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
    END LOOP;

    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM store_admins
      WHERE store_id = p_store_id AND employee_id = result
    );

    attempts := attempts + 1;
    IF attempts > 200 THEN
      RAISE EXCEPTION 'Could not generate a unique employee_id after 200 attempts';
    END IF;
  END LOOP;

  RETURN result;
END;
$$;
