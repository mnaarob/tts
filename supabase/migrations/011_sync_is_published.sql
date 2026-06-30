-- Sync is_published between inventory (tts) and website (milladweb).
--
-- 1. Backfill: every product already visible on the website (has a store_id)
--    gets is_published = true to match reality.
-- 2. Trigger: when is_published flips to true and store_id is null,
--    auto-populate store_id from the stores table via organization_id.
--    This lets the inventory app publish products without knowing store_id.

-- ============================================================
-- STEP 1: Backfill — mark existing website products as published
-- ============================================================

UPDATE products
SET is_published = true
WHERE store_id IS NOT NULL
  AND is_published IS DISTINCT FROM true;

-- ============================================================
-- STEP 2: Trigger — auto-link store_id when publishing
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_store_id_on_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_published = true
     AND (NEW.store_id IS NULL OR NEW.store_id = '')
     AND NEW.organization_id IS NOT NULL
  THEN
    SELECT s.id INTO NEW.store_id
    FROM stores s
    WHERE s.organization_id = NEW.organization_id
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_store_id_on_publish ON products;
CREATE TRIGGER trg_sync_store_id_on_publish
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE public.sync_store_id_on_publish();

NOTIFY pgrst, 'reload schema';
