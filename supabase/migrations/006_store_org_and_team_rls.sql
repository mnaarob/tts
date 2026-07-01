-- Store org link + team RLS

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;

UPDATE stores s
SET organization_id = o.id
FROM store_admins sa
JOIN organizations o ON o.owner_id = sa.user_id
WHERE sa.store_id = s.id
  AND s.organization_id IS NULL;

DROP POLICY IF EXISTS "Users can manage categories in own org" ON categories;
DROP POLICY IF EXISTS "Users can manage categories in their store org" ON categories;
CREATE POLICY "Users can manage categories in their store org"
  ON categories FOR ALL
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

DROP POLICY IF EXISTS "Users can manage products in own org" ON products;
DROP POLICY IF EXISTS "Users can manage products in their store org" ON products;
CREATE POLICY "Users can manage products in their store org"
  ON products FOR ALL
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

DROP POLICY IF EXISTS "Users can manage stock in own org" ON stock_movements;
DROP POLICY IF EXISTS "Users can manage stock in their store org" ON stock_movements;
CREATE POLICY "Users can manage stock in their store org"
  ON stock_movements FOR ALL
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

DROP POLICY IF EXISTS "Store members can view linked organization" ON organizations;
CREATE POLICY "Store members can view linked organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT s.organization_id
      FROM store_admins sa
      JOIN stores s ON s.id = sa.store_id
      WHERE sa.user_id = auth.uid() AND s.organization_id IS NOT NULL
    )
  );
