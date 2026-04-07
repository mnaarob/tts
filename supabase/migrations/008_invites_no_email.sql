-- Employee self-signup: invites keyed by store + employee_id (email optional until signup).

DROP INDEX IF EXISTS store_invites_store_email_lower_idx;

CREATE UNIQUE INDEX IF NOT EXISTS store_invites_store_employee_idx
  ON store_invites (store_id, employee_id);

ALTER TABLE store_invites ALTER COLUMN email DROP NOT NULL;
ALTER TABLE store_invites ALTER COLUMN email SET DEFAULT '';

CREATE POLICY "store_managers_insert_invites"
  ON store_invites FOR INSERT
  WITH CHECK (
    invited_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM store_admins sa
      WHERE sa.store_id = store_invites.store_id
        AND sa.user_id = auth.uid()
        AND sa.role IN ('owner', 'manager')
    )
  );

-- Avoid generating an ID that is already reserved in pending invites.
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
    )
    AND NOT EXISTS (
      SELECT 1 FROM store_invites
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
