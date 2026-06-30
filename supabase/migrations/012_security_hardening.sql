-- Security hardening migration:
--   1. Lock products.is_published on INSERT for staff (companion to 010).
--   2. claim_employee_invite RPC so an *already authenticated* user can link
--      a pending invite to their account themselves — without an Edge Function
--      ever touching their password. Closes the silent-password-overwrite path
--      in claim-employee-signup.

-- ============================================================
-- STEP 1: Staff cannot publish on INSERT either
-- ============================================================

CREATE OR REPLACE FUNCTION public.products_lock_is_published_for_staff_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_published = true THEN
    IF EXISTS (
      SELECT 1
      FROM store_admins sa
      JOIN stores s ON s.id = sa.store_id
      WHERE sa.user_id = auth.uid()
        AND sa.role = 'staff'
        AND s.organization_id = NEW.organization_id
    ) THEN
      NEW.is_published := false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_lock_is_published_for_staff_insert ON products;
CREATE TRIGGER products_lock_is_published_for_staff_insert
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE PROCEDURE public.products_lock_is_published_for_staff_insert();

-- ============================================================
-- STEP 2: claim_employee_invite RPC
--
-- Authenticated users only. The RPC trusts auth.uid() / auth.email() —
-- which Supabase derives from the bearer JWT — instead of taking the
-- email as an argument, so an attacker can't claim an invite that
-- doesn't belong to their session.
-- ============================================================

CREATE OR REPLACE FUNCTION public.claim_employee_invite(
  p_store_name text,
  p_employee_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     uuid := auth.uid();
  v_user_email  text;
  v_store_id    text;
  v_invite      RECORD;
  v_emp_upper   text;
  v_store_norm  text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not signed in');
  END IF;

  SELECT lower(email) INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  IF v_user_email IS NULL OR v_user_email = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Account is missing email');
  END IF;

  v_store_norm := trim(coalesce(p_store_name, ''));
  v_emp_upper  := upper(left(trim(coalesce(p_employee_id, '')), 6));

  IF v_store_norm = '' OR length(v_emp_upper) <> 6 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid store, Employee ID, or email');
  END IF;

  SELECT id INTO v_store_id
  FROM stores
  WHERE lower(name) = lower(v_store_norm)
  LIMIT 1;

  IF v_store_id IS NULL THEN
    -- Generic message — never reveal which of (store, employee, email) was wrong.
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid store, Employee ID, or email');
  END IF;

  SELECT id, role, email, full_name, employee_id INTO v_invite
  FROM store_invites
  WHERE store_id = v_store_id
    AND employee_id = v_emp_upper
  LIMIT 1;

  IF NOT FOUND
     OR lower(coalesce(trim(v_invite.email), '')) <> v_user_email THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid store, Employee ID, or email');
  END IF;

  -- Idempotent — if they're already linked, succeed silently.
  INSERT INTO store_admins (store_id, user_id, role, employee_id, display_name)
  VALUES (
    v_store_id,
    v_user_id,
    v_invite.role,
    v_emp_upper,
    NULLIF(trim(coalesce(v_invite.full_name, '')), '')
  )
  ON CONFLICT (store_id, employee_id) DO NOTHING;

  DELETE FROM store_invites WHERE id = v_invite.id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_employee_invite(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.claim_employee_invite(text, text) TO authenticated;

NOTIFY pgrst, 'reload schema';
