-- Tech to Store - Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations (one per store/business)
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Categories (belong to organization)
create table categories (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique(organization_id, name)
);

-- Products (belong to organization, optional category)
create table products (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  sku text,
  barcode text,
  price decimal(10, 2) not null default 0,
  quantity integer not null default 0,
  low_stock_threshold integer default 5,
  image_url text,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stock movements (for audit trail)
create table stock_movements (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete cascade not null,
  type text not null check (type in ('receive', 'adjust', 'sale')),
  quantity integer not null,
  note text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table organizations enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table stock_movements enable row level security;

-- Organizations: users can only access their own
create policy "Users can view own organizations"
  on organizations for select
  using (auth.uid() = owner_id);

create policy "Users can insert own organizations"
  on organizations for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own organizations"
  on organizations for update
  using (auth.uid() = owner_id);

-- Categories: users can access categories of their organizations
create policy "Users can manage categories in own org"
  on categories for all
  using (
    organization_id in (select id from organizations where owner_id = auth.uid())
  )
  with check (
    organization_id in (select id from organizations where owner_id = auth.uid())
  );

-- Products: same as categories
create policy "Users can manage products in own org"
  on products for all
  using (
    organization_id in (select id from organizations where owner_id = auth.uid())
  )
  with check (
    organization_id in (select id from organizations where owner_id = auth.uid())
  );

-- Stock movements
create policy "Users can manage stock in own org"
  on stock_movements for all
  using (
    organization_id in (select id from organizations where owner_id = auth.uid())
  )
  with check (
    organization_id in (select id from organizations where owner_id = auth.uid())
  );

-- Note: Organizations are created in the app when user first signs in (see useOrganization hook).
-- This avoids auth trigger issues that can cause signup 500 errors.
