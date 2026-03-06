-- Add best-before date and expiry warning to products
-- Run in Supabase SQL Editor

alter table products add column if not exists best_before_date date;
alter table products add column if not exists expiry_warning_days integer default 7;
