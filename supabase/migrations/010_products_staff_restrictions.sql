-- Product RLS: staff cannot publish or delete

DROP POLICY IF EXISTS "Users can manage products in their store org" ON products;

CREATE POLICY "Store org members can select products"
  ON products FOR SELECT
  USING (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    OR organization_id IN (
      SELECT s.organization_id
      FROM store_admins sa
      JOIN stores s ON s.id = sa.store_id
      WHERE sa.user_id = auth.uid() AND s.organization_id IS NOT NULL
    )
  );

CREATE POLICY "Store org members can insert products"
  ON products FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    OR organization_id IN (
      SELECT s.organization_id
      FROM store_admins sa
      JOIN stores s ON s.id = sa.store_id
      WHERE sa.user_id = auth.uid() AND s.organization_id IS NOT NULL
    )
  );

CREATE POLICY "Store org members can update products"
  ON products FOR UPDATE
  USING (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    OR organization_id IN (
      SELECT s.organization_id
      FROM store_admins sa
      JOIN stores s ON s.id = sa.store_id
      WHERE sa.user_id = auth.uid() AND s.organization_id IS NOT NULL
    )
  )
  WITH CHECK (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    OR organization_id IN (
      SELECT s.organization_id
      FROM store_admins sa
      JOIN stores s ON s.id = sa.store_id
      WHERE sa.user_id = auth.uid() AND s.organization_id IS NOT NULL
    )
  );

CREATE POLICY "Owner or manager can delete products"
  ON products FOR DELETE
  USING (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    OR organization_id IN (
      SELECT s.organization_id
      FROM store_admins sa
      JOIN stores s ON s.id = sa.store_id
      WHERE sa.user_id = auth.uid()
        AND s.organization_id IS NOT NULL
        AND sa.role IN ('owner', 'manager')
    )
  );

CREATE OR REPLACE FUNCTION public.products_lock_is_published_for_staff()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.is_published IS DISTINCT FROM OLD.is_published THEN
    IF EXISTS (
      SELECT 1
      FROM store_admins sa
      JOIN stores s ON s.id = sa.store_id
      WHERE sa.user_id = auth.uid()
        AND sa.role = 'staff'
        AND s.organization_id = NEW.organization_id
    ) THEN
      NEW.is_published := OLD.is_published;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_lock_is_published_for_staff ON products;
CREATE TRIGGER products_lock_is_published_for_staff
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE public.products_lock_is_published_for_staff();

NOTIFY pgrst, 'reload schema';
