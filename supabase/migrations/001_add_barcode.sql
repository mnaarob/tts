alter table products add column if not exists barcode text;
create index if not exists idx_products_barcode_org on products(organization_id, barcode);
