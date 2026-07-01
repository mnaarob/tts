-- is_published sync + store_id on publish

UPDATE products
SET is_published = true
WHERE store_id IS NOT NULL
  AND is_published IS DISTINCT FROM true;

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
