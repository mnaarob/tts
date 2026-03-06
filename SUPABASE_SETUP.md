# Supabase Setup

## 1. Run the database schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/iyubmgzxypcanrbyuyck) → **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL

This creates:
- `organizations` – one per store (created when user first visits dashboard)
- `categories` – product categories
- `products` – inventory items
- `stock_movements` – audit trail for stock changes
- Row Level Security (RLS) policies

## 1b. If you already ran the schema and get signup 500 errors

Run `supabase/fix-signup-trigger.sql` in the SQL Editor to remove the auth trigger.

## 1c. Add barcode column (for scan-to-add feature)

If you already have the products table, run `supabase/migrations/001_add_barcode.sql` to add the barcode column.

## 2. Disable email confirmation (recommended for development)

**Important:** Supabase requires email confirmation by default. Until you confirm your email, you'll get "Invalid login credentials" when trying to sign in.

To fix this for development:

1. Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Turn off **Confirm email**
3. Click **Save**

After this, new signups will get a session immediately and go straight to the dashboard.

## 3. Test the flow

1. Run `npm run dev`
2. Click **Sign up** and create an account (use a store name)
3. After signup, you’ll be redirected to the inventory dashboard
4. Add categories and products from the dashboard (Add Product / Add Category when implemented)
