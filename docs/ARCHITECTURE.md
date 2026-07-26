# Tech to Store — Complete Architecture Audit

Code-verified learning guide for the repository at the project root.  
Companion interactive summary: Cursor Canvas `architecture-audit.canvas.tsx`.

**Rules used while writing this document**

- Only describe what exists in the committed codebase.
- If something is unclear or missing from the repo, it is labeled: **I could not verify this from the available code.**
- No invented frameworks, APIs, tables, or hosting details.

Live product (from `README.md`): [techtostore.com](https://www.techtostore.com).

---

## PART 1 — HIGH-LEVEL ARCHITECTURE

### 1. What type of application this is

**Tech to Store** is a **single-page web application (SPA)** for Canadian retailers: a marketing website plus a **cloud inventory dashboard** (products, categories, stock views, team invites, barcode scanning).

The repo is a **small monorepo**:

| App | Path | Purpose |
|-----|------|---------|
| Main product | repo root (`src/`) | Production SPA: marketing + auth + inventory |
| InventoryUI | `InventoryUI/` | Standalone **UI mock** dashboard with hardcoded data |

There is **no custom application server** (no Express/FastAPI/Rails). Backend capabilities come from **Supabase** (Auth, PostgreSQL + RLS, one Edge Function).

### 2. Frontend framework

- **React 18** (`react`, `react-dom`)
- **Vite 5** as bundler/dev server
- **TypeScript**
- **react-router-dom v6** with **`HashRouter`** (routes look like `/#/inventory`)
- **Tailwind CSS 3** for styling
- **Framer Motion** for animations
- **lucide-react** for icons

### 3. Programming languages

| Layer | Language |
|-------|----------|
| Frontend | TypeScript / TSX, CSS |
| Edge Function | TypeScript on **Deno** (`supabase/functions/claim-employee-signup/index.ts`) |
| Database | SQL (`supabase/schema.sql`, `supabase/migrations/*.sql`) |
| Scripts | Bash (`deploy.sh`, `scripts/*.sh`) |

### 4. Libraries and major dependencies

From root `package.json`:

| Package | Role |
|---------|------|
| `@supabase/supabase-js` | Auth + database client |
| `react-router-dom` | Client routing |
| `@marsidev/react-turnstile` | Cloudflare Turnstile CAPTCHA widget |
| `@zxing/browser` | Client-side barcode scanning |
| `framer-motion` | UI motion |
| `lucide-react` | Icons |
| `vite`, `@vitejs/plugin-react`, `tailwindcss`, `typescript` | Tooling |

`InventoryUI/package.json` has React, Framer Motion, Lucide, Emotion, Tailwind — **no** Supabase or router.

### 5. Backend technology

**Supabase Backend-as-a-Service:**

- Supabase Auth (email/password, JWT sessions)
- PostgreSQL via PostgREST (`.from(...)` queries)
- SQL RPCs (`.rpc(...)`)
- One Deno Edge Function: `claim-employee-signup`

There are **no** Express routes, Nest controllers, or GraphQL servers in this repo.

### 6. Database

**PostgreSQL** hosted by Supabase.

Tables defined or altered in committed SQL:

- `organizations`, `categories`, `products`, `stock_movements` — `supabase/schema.sql`
- `store_invites` — migrations `007`–`009`
- Columns/policies on `stores`, `store_admins` — migrations (see Part 8)

**I could not verify this from the available code:** a `CREATE TABLE` for `stores` or `store_admins`. Migrations `ALTER`/query them; creation may live only in the live Supabase project.

### 7. Authentication system

**Supabase Auth** via `@supabase/supabase-js`:

- `signInWithPassword` in `AuthContext.signIn`
- Session restored with `getSession` + `onAuthStateChange`
- Global sign-out: `signOut({ scope: 'global' })`
- Password reset: `resetPasswordForEmail` / `updateUser`
- Optional **Cloudflare Turnstile** on auth forms
- Employee access also requires store name + Employee ID validation RPCs after email/password succeeds

### 8. External APIs / third-party services

| Service | Where used | Purpose |
|---------|------------|---------|
| Supabase | `src/lib/supabase.ts`, Edge Function | Auth, DB, RPC, Edge Functions |
| Cloudflare Turnstile | `AuthTurnstile.tsx`, Edge Function `siteverify` | Bot protection |
| OpenFoodFacts | `useBarcodeLookup.ts` | Product name/image by barcode |
| Google Fonts | `index.html` / CSS | Inter font |

No Stripe, SendGrid, or other payment/email SDKs appear in `package.json` or frontend `fetch` calls (beyond the above).

### 9. Hosting / deployment (from config)

| Target | Evidence |
|--------|----------|
| **Vercel** (primary per README) | `vercel.json`, `deploy.sh`, `.vercel/project.json`, README |
| Netlify | `netlify.toml` |
| GitHub Pages | `.github/workflows/deploy.yml` |
| Supabase cloud | `VITE_SUPABASE_URL`, Edge Function deploy scripts |

Domains mentioned in README / deploy script comments: `techtostore.com`, `www.techtostore.com`.

### 10. How pieces communicate

```
User opens techtostore.com
        ↓
Browser loads index.html → Vite bundle → React mounts App
        ↓
AuthProvider loads supabase.auth session (JWT in client storage managed by supabase-js)
        ↓
HashRouter renders a page
        ↓
User action (e.g. Add Product)
        ↓
React handler in InventoryDashboard / modal
        ↓
supabase.from('products').insert(...)  (HTTPS to Supabase with anon key + user JWT)
        ↓
Postgres + RLS policies accept/reject
        ↓
JSON response → setState / fetchData() → UI re-renders
```

Employee signup additionally:

```
SignupPage → supabase.functions.invoke('claim-employee-signup')
        ↓
Deno Edge Function (service role) → createUser + store_admins insert + delete invite
```

Barcode enrichment:

```
Browser → https://world.openfoodfacts.net/api/v2/product/{barcode}.json
```

---

## PART 2 — COMPLETE ARCHITECTURE MAP

```
Browser
  └── index.html
        └── src/index.tsx          (auth hash intercept + createRoot)
              └── App.tsx
                    ├── AuthProvider (contexts/AuthContext.tsx)
                    │     └── supabase.auth
                    └── HashRouter
                          ├── / → LandingPage
                          │     ├── Header
                          │     ├── Hero
                          │     ├── Services
                          │     ├── Features
                          │     └── Footer
                          ├── /login → LoginPage
                          ├── /signup → SignupPage
                          ├── /forgot-password → ForgotPasswordPage
                          ├── /reset-password → ResetPasswordPage
                          ├── /checkout → CheckoutPage
                          ├── /themes[/:slug] → ThemesPlaygroundPage
                          ├── /inventory → ProtectedRoute → InventoryDashboard
                          │                 ├── useOrganization / useJwtClaims
                          │                 ├── BarcodeScannerModal
                          │                 ├── AddProductModal
                          │                 ├── ScannedProductCard
                          │                 ├── MfaBanner
                          │                 └── supabase.from / .rpc
                          └── * → Navigate to /

Supabase project
  ├── Auth
  ├── Postgres tables + RLS
  ├── RPCs (get_store_team, validate_employee_login, …)
  └── Edge Function claim-employee-signup

External
  ├── Cloudflare Turnstile
  └── OpenFoodFacts

Separate (not in HashRouter)
  └── InventoryUI/ (mock dashboard)
```

**Entry points**

| Entry | File |
|-------|------|
| HTML shell | `index.html` |
| JS bootstrap | `src/index.tsx` |
| Root component | `src/App.tsx` |
| Supabase client | `src/lib/supabase.ts` |
| InventoryUI | `InventoryUI/index.html` → `InventoryUI/src/index.tsx` |

**State management:** React Context for auth only; everything else is local `useState` / `useMemo` / `localStorage` (`tts_active_tab`). No Redux/Zustand.

**Configuration:** Vite env (`import.meta.env.VITE_*`), `.env.example`, `vite.config.ts`, `vercel.json`, `supabase/config.toml`.

---

## PART 3 — UI BACK TO CODE

### Landing page (`#/`)

| Visible element | Component | File | Notes |
|-----------------|-----------|------|-------|
| Top nav | `Header` | `src/components/Header.tsx` | Services/Features scroll; Templates → `#/themes`; Sign in / Create account or My Inventory |
| Hero | `Hero` | `src/components/Hero.tsx` | Tailwind layout |
| Services section | `Services` | `src/components/Services.tsx` | `id="services"` for scroll |
| Features section | `Features` | `src/components/Features.tsx` | `id="features"` |
| Footer | `Footer` | `src/components/Footer.tsx` | |
| Brand mark | `Logo` | `src/components/Logo.tsx` | Used across pages |

**Not currently rendered on the landing page** (files exist, not imported by `LandingPage.tsx`):

- `Pricing.tsx`
- `Testimonials.tsx`
- `InteractiveDemo.tsx`

**Nav click flow (Services):**

```
User clicks “Services” in Header
  ↓
scrollToSection('services')
  ↓
If not on /, navigate('/') then scroll
  ↓
document.getElementById('services') scrolls into view
```

**Templates click:**

```
User clicks “Templates”
  ↓
<Link to="/themes">
  ↓
HashRouter → ThemesPlaygroundPage
```

### Auth pages

| Screen | File | Key UI |
|--------|------|--------|
| Sign in | `LoginPage.tsx` | Store name, Employee ID, email, password, Turnstile |
| Create account | `SignupPage.tsx` | Same fields; calls Edge Function |
| Forgot password | `ForgotPasswordPage.tsx` | Email + Turnstile |
| Reset password | `ResetPasswordPage.tsx` | New password after recovery hash |

### Inventory (`#/inventory`)

Almost the entire logged-in product UI is **one component**: `InventoryDashboard`.

| Visible part | Where in code |
|--------------|---------------|
| Sidebar tabs | `SIDEBAR_LINKS` + `activeTab` / `changeTab` |
| Mobile drawer | `sidebarOpen` state |
| Store name header | `organization?.name` from `useOrganization` |
| Sign out | `signOut` from `useAuth` |
| Dashboard stats / recent products | Computed from `products` state inside same file |
| Products table + search | Products tab JSX + `productSearchQuery` |
| Categories | Categories tab + category modals |
| Stock | Stock tab (movements list) |
| Reports | Reports tab (derived UI in same file) |
| Team | Team tab (`canSeeTeam` / `canManageTeam`) |
| Add / Edit product | `AddProductModal` |
| Scan | `BarcodeScannerModal` + `handleScan` |
| MFA notice | `MfaBanner` |

**Tab “navigation” is not React Router** — it is `setActiveTab` + `localStorage.setItem('tts_active_tab', tab)`.

```
User clicks “Products” in sidebar
  ↓
changeTab('Products')
  ↓
activeTab === 'Products' branch renders product table
  ↓
Data already loaded by fetchData() from Supabase
```

### Themes (`#/themes`)

`ThemesPlaygroundPage` + `src/data/themes.ts` + static HTML under `public/themes/` (and source themes under `WebTheme/GroceryStore/`).

### Checkout (`#/checkout`)

`CheckoutPage` — plan selection UI and form fields. **No payment processor SDK or API call** appears in the file.

### InventoryUI (separate app)

```
Sidebar | DashboardHeader | StatCards | AlertBanners | RecentProducts
```

All mock data in-component. Buttons are mostly non-functional UI.

---

## PART 4 — MAJOR FEATURES

### FEATURE: Marketing landing

**A. UI** — `LandingPage.tsx` composes Header, Hero, Services, Features, Footer.  
**B. Logic** — Mostly presentational; Header uses `useAuth` for CTA swap.  
**C. Data** — None fetched.  
**D–E. Backend/DB** — N/A.  
**F. Flow:** Open site → `#/` → static sections render.

### FEATURE: Authentication (session)

**A. UI** — Login/Signup/Forgot/Reset pages + `AuthTurnstile`.  
**B. Logic** — `AuthProvider` owns `user`, `session`, `loading`, `signIn`, `signOut`.  
**C. Data** — Supabase Auth APIs.  
**D. Backend** — Supabase Auth service (hosted).  
**E. DB** — `auth.users` (Supabase-managed; not defined in `schema.sql`).  
**F. Flow:**

```
User submits login
  ↓
LoginPage.handleSubmit
  ↓
AuthContext.signIn → supabase.auth.signInWithPassword
  ↓
validate_employee_login RPC (store + employee ID)
  ↓
navigate('/inventory')
  ↓
ProtectedRoute allows InventoryDashboard
```

### FEATURE: Employee signup / invite claim

**A. UI** — `SignupPage`; Team invite form in `InventoryDashboard`.  
**B. Logic** — `handleSubmit` on Signup; `handleTeamInvite` on dashboard; `pendingInvite` helpers.  
**C. Data** — `supabase.functions.invoke('claim-employee-signup')`; RPCs `claim_employee_invite`, `generate_employee_id`.  
**D. Backend** — Edge Function uses **service role** to create user, insert `store_admins`, delete invite.  
**E. Tables** — `stores`, `store_invites`, `store_admins`.  
**F. Flow:** Manager invites → employee signs up with matching email/ID → Edge Function links membership → auto sign-in → inventory.

### FEATURE: Inventory / products

**A. UI** — Dashboard Products tab; `AddProductModal`; scan modals.  
**B. Components** — `InventoryDashboard` owns lists and handlers; modal owns form fields.  
**C. Fetch** — `fetchData()` selects `products`, `categories`, `stock_movements`.  
**D. Writes** — `handleSaveProduct` (insert), `handleUpdateProduct` (update), `handleDeleteProduct` (delete).  
**E. Table** — `products` (+ join `categories(name)`).  
**F. Flow:** Open inventory → org resolved → fetchData → table → Add Product → onSave → insert → fetchData → UI updates.

### FEATURE: Categories

Handlers `handleSaveCategory` / `handleDeleteCategory` in `InventoryDashboard` against `categories` table. UI: Categories tab + modals in the same file.

### FEATURE: Stock movements

- **Read:** last 10 rows via `fetchData` (`.from('stock_movements').select('*, products(name)')`).
- **Stock tab UI:** “Receive Stock” and “Adjust Stock” buttons are **presentational only** (no `onClick` handlers / no inserts).
- **Write from frontend on create product:** explicitly **not** done (comment in `handleSaveProduct` about a production trigger doubling quantity).
- Quantity changes in practice happen via **product edit** (`handleUpdateProduct` updates `products.quantity`).
- **I could not verify this from the available code:** the production trigger that re-applies `stock_movements.quantity` to `products.quantity` (mentioned only in a comment).

### FEATURE: Barcode scanning + OpenFoodFacts

```
User clicks Scan
  ↓
BarcodeScannerModal (@zxing/browser)
  ↓
handleScan(barcode)
  ↓
checkExisting in products OR lookupProductFromApi (OpenFoodFacts)
  ↓
AddProductModal prefilled OR ScannedProductCard
```

Files: `BarcodeScannerModal.tsx`, `useBarcodeLookup.ts`, `sanitize.ts`, `ScannedProductCard.tsx`.

### FEATURE: Team management

- Visible if `useJwtClaims()` returns `store_id`.
- Invite/remove if role is `owner` or `manager`.
- RPCs: `get_store_team`, `generate_employee_id`, `remove_store_member`.
- Table writes: `store_invites` insert/delete.

### FEATURE: Themes playground

Static theme gallery/preview — `ThemesPlaygroundPage.tsx`, `data/themes.ts`, `public/themes/`.

### FEATURE: Checkout

UI-only plan/checkout form in `CheckoutPage.tsx`. Plan from `?plan=` search param. **No backend charge flow in code.**

### FEATURE: InventoryUI demo

Prototype dashboard under `InventoryUI/`. Not part of production HashRouter.

---

## PART 5 — FILE-BY-FILE EXPLANATION

### Bootstrap & app shell

#### `index.html`

**Responsibility:** HTML shell, font preconnect, `#root`.  
**Exports:** N/A.  
**Used by:** Vite entry.

#### `src/index.tsx`

**Responsibility:** Import CSS; intercept Supabase recovery/invite hash fragments; `createRoot(<App />)`.  
**Imports:** `App`, `react-dom/client`, `./index.css`.  
**Exports:** none (side-effect entry).

#### `src/App.tsx`

**Responsibility:** `AuthProvider` + `HashRouter` + all routes.  
**Exports:** `App`.  
**Used by:** `index.tsx`.

#### `src/index.css`

**Responsibility:** Tailwind layers + global base styles.

#### `src/lib/supabase.ts`

**Responsibility:** Create singleton Supabase client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Throws if missing.  
**Exports:** `supabase`.

### Auth & access

#### `src/contexts/AuthContext.tsx`

**Responsibility:** Global auth state; `signIn`, `signOut`; clears `sessionStorage` on `SIGNED_OUT`.  
**Exports:** `AuthProvider`, `useAuth`.

#### `src/components/ProtectedRoute.tsx`

**Responsibility:** Redirect unauthenticated users to `/login`; optional `allowedRoles` via JWT decode.  
**Used by:** `/inventory` route (without `allowedRoles` today).

#### `src/components/AuthTurnstile.tsx`

**Responsibility:** Turnstile widget; site key from `VITE_TURNSTILE_SITE_KEY`.  
**Exports:** `AuthTurnstile`, `TURNSTILE_SITE_KEY`, handle type.

#### `src/components/MfaBanner.tsx`

**Responsibility:** Lists MFA factors via `supabase.auth.mfa.listFactors()` and shows a banner if none enrolled. Does not enroll MFA itself.

#### `src/lib/password.ts`

**Responsibility:** Client password strength checks for signup/reset.

#### `src/lib/pendingInvite.ts`

**Responsibility:** Persist pending invite in `sessionStorage` when signup returns `account_exists`.

### Pages

#### `src/pages/LandingPage.tsx`

Composes marketing sections. **Exports:** `LandingPage`.

#### `src/pages/LoginPage.tsx`

Employee login form: email/password + store + employee ID; optional invite claim. **Exports:** `LoginPage`.

#### `src/pages/SignupPage.tsx`

Employee self-signup via Edge Function. **Exports:** `SignupPage`.

#### `src/pages/ForgotPasswordPage.tsx` / `ResetPasswordPage.tsx`

Password recovery UX.

#### `src/pages/InventoryDashboard.tsx`

**Core product surface** (~2094 lines): tabs, data loading, product/category/team CRUD, barcode orchestration. **Exports:** `InventoryDashboard`.

#### `src/pages/ThemesPlaygroundPage.tsx`

Theme browser/preview.

#### `src/pages/CheckoutPage.tsx`

Checkout UI mock (no payment API).

### Inventory-related components

#### `src/components/AddProductModal.tsx`

Form for create/edit product; calls `onSave` / `onDelete` props (no direct Supabase).  

#### `src/components/BarcodeScannerModal.tsx`

Camera/file barcode decode with ZXing.

#### `src/components/ScannedProductCard.tsx`

Preview card after lookup-mode scan.

### Marketing components

`Header`, `Hero`, `Services`, `Features`, `Footer`, `Logo` — landing chrome.  
`Pricing`, `Testimonials`, `InteractiveDemo` — **present but unused by LandingPage**.

### Hooks

| File | Role |
|------|------|
| `useOrganization.ts` | Resolve org for owner or team member via `organizations` / `store_admins` / `stores` |
| `useJwtClaims.ts` | `store_id` + `store_role` from JWT or `store_admins` fallback |
| `useBarcodeLookup.ts` | Existing product check + OpenFoodFacts |
| `useBodyScrollLock.ts` | Lock body scroll for modals |

### Lib helpers

| File | Role |
|------|------|
| `sanitize.ts` | Barcode validation/sanitization |
| `isPublished.ts` | Normalize `is_published` boolean from DB |
| `password.ts` | Password rules |
| `pendingInvite.ts` | Invite handoff storage |

### Data

#### `src/data/themes.ts`

Theme metadata for playground.

### Supabase

| Path | Role |
|------|------|
| `supabase/schema.sql` | Base tables + initial RLS |
| `supabase/migrations/001`–`012` | Evolutions (barcode, expiry, team, invites, staff restrictions, hardening) |
| `supabase/functions/claim-employee-signup/index.ts` | Privileged employee signup |
| `supabase/config.toml` | Local/Supabase CLI config |
| `supabase/fix-signup-trigger.sql` | Fix script (SQL) |

### Config / deploy

`package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig*.json`, `vercel.json`, `netlify.toml`, `deploy.sh`, `.github/workflows/deploy.yml`, `.env.example`, `scripts/*`.

### InventoryUI

| File | Role |
|------|------|
| `InventoryUI/src/App.tsx` | Layout shell + `sidebarOpen` |
| `Sidebar.tsx` | Mock nav |
| `DashboardHeader.tsx` | Header + cosmetic Sign out |
| `StatCards.tsx` | Hardcoded stats |
| `AlertBanners.tsx` | Hardcoded alerts |
| `RecentProducts.tsx` | Hardcoded product row |

---

## PART 6 — IMPORT AND DEPENDENCY RELATIONSHIPS

```
App.tsx
├── AuthProvider (AuthContext → supabase)
├── ProtectedRoute (useAuth, decodeJwt)
└── Routes
    ├── LandingPage
    │   ├── Header (useAuth, Logo)
    │   ├── Hero
    │   ├── Services
    │   ├── Features
    │   └── Footer
    ├── LoginPage → useAuth, AuthTurnstile, supabase.rpc, pendingInvite
    ├── SignupPage → useAuth, AuthTurnstile, supabase.functions, password, pendingInvite
    ├── ForgotPasswordPage / ResetPasswordPage → supabase.auth, AuthTurnstile
    ├── CheckoutPage → Logo, framer-motion (no supabase)
    ├── ThemesPlaygroundPage → data/themes
    └── InventoryDashboard
        ├── useAuth, useOrganization, useJwtClaims, useBarcodeLookup
        ├── BarcodeScannerModal
        ├── AddProductModal → BarcodeScannerModal, sanitize, isPublished
        ├── ScannedProductCard
        ├── MfaBanner
        ├── Logo
        └── supabase.from / .rpc
```

**InventoryDashboard data path:**

```
InventoryDashboard
├── useOrganization → organizations, store_admins, stores
├── fetchData → products, categories, stock_movements
├── handleSaveProduct / handleUpdateProduct / handleDeleteProduct → products
├── category handlers → categories
└── Team handlers → get_store_team, store_invites, remove_store_member
```

**InventoryUI:**

```
App.tsx
├── Sidebar
├── DashboardHeader
├── StatCards
├── AlertBanners
└── RecentProducts
(no services / API layer)
```

---

## PART 7 — TRACE IMPORTANT USER ACTIONS END-TO-END

### Login

1. User opens `#/login` (`LoginPage`).
2. Submits store name, Employee ID, email, password (+ Turnstile if configured).
3. `handleSubmit` → `signIn` → `supabase.auth.signInWithPassword`.
4. If pending invite in sessionStorage → `claim_employee_invite` RPC.
5. Else → `validate_employee_login` RPC; on failure, `signOut` and error.
6. On success → `navigate` to `/inventory` (or prior `from` location).
7. `ProtectedRoute` sees `user` → renders `InventoryDashboard`.

### Logout

1. User clicks Sign out in inventory header.
2. `signOut()` → `supabase.auth.signOut({ scope: 'global' })`.
3. Context clears user/session; `SIGNED_OUT` clears `sessionStorage`.
4. User navigating to `/inventory` is redirected to `/login`.

### Registration (employee)

1. Manager created invite in Team tab (`store_invites` insert + `generate_employee_id`).
2. Employee opens `#/signup`.
3. `SignupPage.handleSubmit` → `supabase.functions.invoke('claim-employee-signup', { body })`.
4. Edge Function: verify Turnstile → find store → match invite email → `auth.admin.createUser` → insert `store_admins` → delete invite.
5. Client signs in, validates employee login, navigates to `/inventory`.
6. If email already exists → `account_exists` → `setPendingInvite` → login page finishes with `claim_employee_invite`.

**Owner self-registration via a public “create store” form:** **I could not verify this from the available code** (SignupPage is employee-invite oriented).

### Add product

1. “Add Product” sets `addModalOpen`.
2. `AddProductModal` collects form state.
3. Submit → `onSave` → `handleSaveProduct`.
4. `supabase.from('products').insert({ organization_id, ... })`.
5. RLS must allow insert for that org.
6. `fetchData()` refreshes lists; modal closes via modal logic after save resolves.

### Edit product

1. Edit click → `openProductForEdit` (loads fresh row) → modal with `initialData`.
2. Save → `handleUpdateProduct` → `.update(...).eq('id').eq('organization_id')`.
3. Staff cannot change publish flag (`canManageCatalog` / `allowWebsitePublish`).

### Delete product

1. In modal (owner/manager) two-step delete confirm.
2. `onDelete` → `handleDeleteProduct` → `.delete()` on `products`.

### Search / filter products

- Client-side filters on already-fetched `products` (`productSearchQuery`, `productCategoryFilterId`).
- No server-side search API.

### Scan barcode

1. Scanner modal returns barcode string.
2. `handleScan` branches on `scannerMode` (`add` vs `lookup`).
3. May call OpenFoodFacts and/or open add modal / scanned card.

### Invite teammate

1. Team tab form → `handleTeamInvite`.
2. `generate_employee_id` RPC → insert `store_invites`.
3. UI shows Employee ID to share.

### Remove teammate / revoke invite

- `remove_store_member` RPC / `store_invites.delete`.

### Forgot / reset password

1. Forgot → `resetPasswordForEmail` with redirect that becomes hash recovery tokens.
2. `index.tsx` rewrites recovery hash to `#/reset-password?...`.
3. Reset page `updateUser({ password })` then global sign-out so user signs in fresh.

### Checkout “pay”

Form UI only — **no charge API traced in code.**

### File upload

**I could not verify this from the available code** as a dedicated storage upload feature. Product `image_url` is a string field (often from OpenFoodFacts), not a Supabase Storage upload flow in the reviewed handlers.

---

## PART 8 — DATABASE ARCHITECTURE

### Technology

PostgreSQL on Supabase + Row Level Security.

### Tables (committed definitions / usage)

#### `organizations` (`schema.sql`)

| Column | Type / notes |
|--------|----------------|
| id | uuid PK |
| name | text |
| owner_id | uuid → `auth.users` |
| created_at, updated_at | timestamptz |

#### `categories`

| Column | Notes |
|--------|--------|
| id | uuid PK |
| organization_id | FK → organizations |
| name | unique per org |
| created_at | |

#### `products`

Base columns in `schema.sql`; migration `002` adds `best_before_date` and `expiry_warning_days`. Barcode exists in base schema (migration `001` is historical/additive).

Important fields used by UI: `name`, `sku`, `barcode`, `price`, `quantity`, `low_stock_threshold`, `image_url`, `is_published`, `category_id`, expiry fields (`best_before_date`, `expiry_warning_days` from migration `002`).

`products.store_id` is **referenced** by migration `011_sync_is_published.sql` (trigger on publish), but **I could not verify this from the available code** that a committed migration adds that column (`ADD COLUMN` for `store_id` is not present in the migration files).

#### `stock_movements`

`type` check: `'receive' | 'adjust' | 'sale'`. Frontend reads; does not insert on product create.

#### `store_invites` (migrations)

Fields used in app: `store_id`, `email`, `role`, `employee_id`, `full_name`, `invited_by`, timestamps / expiry.

#### `stores` / `store_admins`

Used throughout; **CREATE TABLE not in repo**. From usage:

- `stores`: `id`, `name`, `organization_id` (added in migration 006)
- `store_admins`: `store_id`, `user_id`, `role`, `employee_id`, `display_name`

### Relationships (logical)

```
auth.users
  ├── organizations.owner_id
  └── store_admins.user_id → stores.id → organizations.id
                              ↓
                         store_invites.store_id

organizations
  ├── categories
  ├── products → categories
  └── stock_movements → products
```

### RPCs (from migrations / frontend calls)

| RPC | Purpose |
|-----|---------|
| `get_store_team` | List members |
| `validate_employee_login` | Gate login with store + employee ID |
| `generate_employee_id` | 6-char ID |
| `remove_store_member` | Remove membership |
| `claim_employee_invite` | Link invite to current auth user |

### Security

- RLS enabled on core tables in `schema.sql`; later migrations expand policies for team members and restrict staff publish/delete.
- Triggers in later migrations (e.g. staff publish lock, sync `store_id` on publish) — see `010`–`012`.

### Who reads/writes

| Area | Read | Write |
|------|------|-------|
| products/categories | InventoryDashboard | same |
| stock_movements | InventoryDashboard | not from create-product path |
| team/invites | InventoryDashboard | InventoryDashboard + Edge Function |
| auth users | Supabase Auth | Edge Function (admin create) |

---

## PART 9 — AUTHENTICATION AND AUTHORIZATION

### Login flow

Described in Part 7. Dual check: **email/password** then **store + employee ID**.

### Registration flow

Employee path via Edge Function (Part 7). No separate OAuth providers in code.

### Logout flow

Global scope sign-out; clears React state + `sessionStorage` on event.

### Session / tokens

Managed by `@supabase/supabase-js` (access + refresh tokens). App reads `session` / `user` from context. `useJwtClaims` optionally reads custom claims `store_id` / `store_role` from access token payload.

**I could not verify this from the available code:** the Supabase Auth Hook / JWT template that injects those custom claims (fallback DB query exists).

### Cookies / localStorage

- Supabase client persistence: default supabase-js behavior (not customized in `supabase.ts`).
- App-specific: `localStorage['tts_active_tab']`; `sessionStorage` for pending invite + cleared on sign-out.

### Protected routes

Only `/inventory` wraps `ProtectedRoute`. Unauthenticated → `#/login` with `state.from`.

### Roles

| Role | Capabilities in UI (InventoryDashboard) |
|------|----------------------------------------|
| owner / manager | `canManageTeam`, `canManageCatalog` (publish + delete product) |
| staff | Can see team list if `store_id` present; catalog publish/delete UI restricted |

DB also enforces staff restrictions (migrations `010`, `012`).

### MFA

`MfaBanner` encourages enrollment; full MFA challenge UI is **not** implemented as a separate flow in the reviewed pages.

### Unauthenticated access

Public marketing, auth pages, themes, checkout. Inventory redirects to login.

---

## PART 10 — STATE MANAGEMENT

### Global

| State | Owner | Consumers |
|-------|-------|-----------|
| `user`, `session`, `loading` | `AuthProvider` | Header, ProtectedRoute, pages, hooks |

### Server / remote state

Fetched into local component state (not React Query/SWR):

- `organization` in `useOrganization`
- `products`, `categories`, `stockMovements` in `InventoryDashboard`
- `teamMembers`, `pendingInvites` when Team tab active
- JWT/DB claims in `useJwtClaims`

### Local UI state (examples)

`activeTab`, modal open flags, search queries, captcha tokens, sidebar open, invite form fields, etc.

### Forms

Controlled inputs in page/modal components (`useState` per field).

### Cached data

- Tab name in `localStorage`
- Pending invite in `sessionStorage`
- No dedicated cache library

---

## PART 11 — ROUTING

Routes defined in `src/App.tsx` with `HashRouter`.

| URL (hash) | Component | Purpose | Protected? | Main data source |
|------------|-----------|---------|------------|------------------|
| `#/` | LandingPage | Marketing | No | Static |
| `#/login` | LoginPage | Sign in | No | Auth + RPCs |
| `#/signup` | SignupPage | Employee signup | No | Edge Function |
| `#/forgot-password` | ForgotPasswordPage | Reset request | No | Auth |
| `#/reset-password` | ResetPasswordPage | Set new password | No | Auth |
| `#/checkout` | CheckoutPage | Checkout UI | No | Static / query param |
| `#/themes` | ThemesPlaygroundPage | Theme list | No | `themes.ts` / static HTML |
| `#/themes/:slug` | ThemesPlaygroundPage | Theme detail | No | Static |
| `#/inventory` | InventoryDashboard | App | **Yes** | Supabase tables |
| `*` | Navigate `/` | Fallback | — | — |

**Dynamic routes:** `:slug` for themes only.  
**Invalid routes:** redirect home.  
**Inventory sub-nav:** local tab state, not URL segments.

---

## PART 12 — FRONTEND DESIGN AND STYLING

| Mechanism | Location |
|-----------|----------|
| Tailwind | Utility classes in components; `tailwind.config.js` |
| Global CSS | `src/index.css` |
| Motion | `framer-motion` (Header mobile menu, Checkout, InventoryUI, etc.) |
| Icons | `lucide-react` |
| Fonts | Inter via Google Fonts in HTML/CSS |
| Component library | None (no MUI/Chakra); InventoryUI lists `@emotion/react` but components use Tailwind |

**Inventory dashboard look:** slate/indigo/emerald/amber utility palette, responsive tables → cards on mobile, sticky headers, sidebar drawer.

**CSP / security headers:** configured in `vite.config.ts` / `vercel.json` (deployment hardening, not visual design).

---

## PART 13 — BACKEND ARCHITECTURE

There is no traditional MVC server. Map Supabase onto the mental model:

```
HTTP from browser
  ↓
Supabase API gateway
  ↓
Auth | PostgREST | RPC | Edge Functions
  ↓
PostgreSQL (+ RLS) or Deno function logic
  ↓
JSON response
```

### Edge Function request flow (`claim-employee-signup`)

```
POST (from supabase.functions.invoke)
  ↓
CORS / method check
  ↓
Validate body + optional Turnstile verify
  ↓
Service-role Supabase client
  ↓
Lookup stores → store_invites
  ↓
auth.admin.createUser
  ↓
Insert store_admins (rollback user on failure)
  ↓
Delete invite
  ↓
{ ok: true } JSON
```

### “Controllers / services”

Business logic is split between:

1. **Frontend handlers** in `InventoryDashboard` / auth pages  
2. **SQL policies + RPCs** in migrations  
3. **Edge Function** for privileged signup  

### Middleware

- RLS acts as authorization middleware on every table query  
- `ProtectedRoute` is frontend route middleware  
- Edge Function CORS + Turnstile checks  

### Error handling

Frontend maps PostgREST codes (`42501`, `23503`) to user messages; Edge Function returns generic invite errors to avoid enumeration.

### DB connection

Client: anon key + user JWT.  
Edge Function: `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS — use carefully).

---

## PART 14 — ENVIRONMENT VARIABLES AND CONFIGURATION

From `.env.example` and Edge Function code (**names only; never commit values**):

| Variable | Used by | Purpose | Public? |
|----------|---------|---------|---------|
| `VITE_SUPABASE_URL` | `src/lib/supabase.ts`, CI | Project URL | Exposed to browser (expected) |
| `VITE_SUPABASE_ANON_KEY` | same | Publishable anon key | Exposed (RLS must protect data) |
| `VITE_TURNSTILE_SITE_KEY` | `AuthTurnstile.tsx` | Turnstile widget | Public site key |
| `TURNSTILE_SECRET_KEY` | Edge Function + setup script | Server CAPTCHA verify | **Secret — never expose** |
| `SUPABASE_URL` | Edge Function | Same project URL | Server env |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function | Admin API | **Secret — never expose** |
| `ALLOWED_ORIGINS` | Edge Function | CORS allowlist | Server config |

Frontend vars must be prefixed `VITE_` for Vite to inject them.

Danger if leaked: **service role** and **Turnstile secret** allow privilege escalation / CAPTCHA bypass.

---

## PART 15 — DEPLOYMENT AND PRODUCTION ARCHITECTURE

```
Developer
  ↓
git repository
  ↓
npm run build  (vite build → dist/)
  ↓
├── npm run deploy → deploy.sh → vercel --prod
├── Netlify (netlify.toml → publish dist)
└── GitHub Actions → GitHub Pages (base /tts/)
  ↓
End user browser + Supabase cloud + Turnstile + OpenFoodFacts
```

| Concern | Detail |
|---------|--------|
| Dev server | `npm run dev` → Vite |
| Production static host | Vercel (primary) |
| Backend host | Supabase (DB/Auth/Functions) |
| Env in CI | GitHub Actions sets `VITE_*` secrets for Pages build |
| Functions deploy | `npm run deploy:functions` → `scripts/deploy-invite-function.sh` |
| Secret hygiene | `npm run check-secrets` |

InventoryUI is a separate package; **I could not verify this from the available code** that it is deployed with the main site.

---

## PART 16 — BEGINNER-FRIENDLY EXPLANATION

### “I see the homepage hero”

- **What:** Big marketing intro.  
- **Component:** `Hero` in `src/components/Hero.tsx`.  
- **Data:** Hardcoded/marketing copy.  
- **Interact:** Active CTA is **View Services** (scrolls to `#services`). A “Schedule a Demo” button exists only as commented-out code. Sign-in / signup live in `Header`, not Hero.

### “I see Sign in / Create account in the nav”

- **Component:** `Header`.  
- **If logged in:** “My Inventory” → `#/inventory`.  
- **Data:** `useAuth().user`.

### “I see the inventory sidebar”

- **File:** `InventoryDashboard.tsx` (`SIDEBAR_LINKS`).  
- **Not** React Router — tab state.  
- **Data:** Same page’s loaded products/categories when those tabs render.

### “I see product rows”

- **Rendered in:** `InventoryDashboard` tables.  
- **Data:** `products` state from Supabase `products` table filtered by `organization.id`.

### “I click Add Product”

- Modal: `AddProductModal.tsx`.  
- Save runs parent `handleSaveProduct` → inserts into Supabase → list refreshes.

### “I scan a barcode”

- Camera UI: `BarcodeScannerModal`.  
- Lookup: OpenFoodFacts + local `products` check.  
- Result: prefilled modal or `ScannedProductCard`.

### “I invite a teammate”

- Team tab in `InventoryDashboard`.  
- Creates `store_invites` row + shows Employee ID.  
- Teammate uses Signup page + Edge Function.

### “I see InventoryUI in the repo”

- Separate practice/design app with fake Aveeno data.  
- Does not talk to production Supabase.

---

## PART 17 — PRIORITIZED LEARNING PATH

1. **`src/index.tsx` → `src/App.tsx`** — How the SPA boots and routes (HashRouter + auth hash rewrite).  
2. **`src/lib/supabase.ts` + `.env.example`** — How the client is configured.  
3. **`AuthContext.tsx` + `ProtectedRoute.tsx`** — Session and gate.  
4. **`LoginPage.tsx` + `SignupPage.tsx`** — Real auth UX + employee gate + Edge Function call.  
5. **`useOrganization.ts` + `useJwtClaims.ts`** — Multi-tenant org/role context.  
6. **`InventoryDashboard.tsx` — `fetchData`, product handlers only** — Core business loop before reading all 2000 lines.  
7. **`AddProductModal.tsx` + barcode hooks/modals`** — Form → parent → DB.  
8. **`supabase/schema.sql` then migrations `006`, `007`, `010`, `012`** — RLS and team model.  
9. **`claim-employee-signup/index.ts`** — Privileged server path.  
10. **`vercel.json` + `deploy.sh` + README** — How production ships.  
11. **Optional:** `InventoryUI/` as a pure UI reference; `ThemesPlaygroundPage` for static storefront themes.  
12. **Optional dead code awareness:** `Pricing`, `Testimonials`, `InteractiveDemo` unused by landing.

---

## PART 18 — FINAL ARCHITECTURE SUMMARY

### The entire application in one diagram

```
User
  ↓
Browser
  ↓
Vite/React SPA (src/)
  ├── Marketing pages (static)
  ├── Auth pages → AuthContext → Supabase Auth (+ Turnstile)
  └── InventoryDashboard (local state)
        ├── hooks: useOrganization, useJwtClaims, useBarcodeLookup
        ├── modals: AddProduct, Scanner, ScannedProductCard
        └── supabase-js
              ↓
         Supabase Cloud
              ├── Auth (JWT)
              ├── Postgres + RLS
              │     organizations, categories, products,
              │     stock_movements, stores*, store_admins*, store_invites
              ├── RPCs (team / employee validation)
              └── Edge Function claim-employee-signup (service role)
              ↓
         External: OpenFoodFacts, Turnstile verify

* CREATE TABLE not in committed schema — tables used at runtime

Separate: InventoryUI mock (no backend)
Hosted frontend: Vercel (primary)
```

### Top 10 most important files

| # | Path | Why it matters | If removed |
|---|------|----------------|------------|
| 1 | `src/pages/InventoryDashboard.tsx` | Entire inventory product | App has no inventory UI/logic |
| 2 | `src/contexts/AuthContext.tsx` | Session source of truth | No login state |
| 3 | `src/lib/supabase.ts` | Only DB/auth client | All remote calls fail |
| 4 | `src/App.tsx` | Routes + providers | Nothing mounts correctly |
| 5 | `src/hooks/useOrganization.ts` | Scopes all inventory queries | Empty/broken dashboard |
| 6 | `src/components/AddProductModal.tsx` | Create/edit UX | Cannot manage products via UI |
| 7 | `supabase/functions/claim-employee-signup/index.ts` | Employee onboarding | Signup broken |
| 8 | `src/components/ProtectedRoute.tsx` | Guards inventory | Unauthenticated access or no gate |
| 9 | `src/hooks/useJwtClaims.ts` | Roles for Team/catalog | Wrong permissions UI |
| 10 | `supabase/schema.sql` + `migrations/` | Data + security contract | DB/app drift |

### Top 10 concepts to understand

1. **HashRouter SPA** — routes live after `#`.  
2. **BaaS, not custom API** — browser talks to Supabase.  
3. **RLS is the real authorization layer** — anon key is public.  
4. **Organization scoping** — almost all inventory queries filter by `organization_id`.  
5. **Store team model** — `stores` / `store_admins` / invites / employee IDs.  
6. **Dual login gate** — password **and** store+employee ID.  
7. **InventoryDashboard concentration** — tabs + CRUD in one mega-component.  
8. **Edge Function privilege boundary** — service role only for invite claim signup.  
9. **Client-derived UI permissions** — `canManageTeam` / `canManageCatalog` plus DB policies.  
10. **InventoryUI ≠ production inventory** — mock only.

---

## Explicit “could not verify” checklist

1. `CREATE TABLE` for `stores` and `store_admins` in this repo.  
2. Supabase custom JWT hook configuration for `store_id` / `store_role`.  
3. Production trigger that adjusts `products.quantity` from `stock_movements` (comment only).  
4. Owner/store bootstrap signup (non-employee) UI flow.  
5. Real payment processing for CheckoutPage.  
6. Production deploy of `InventoryUI/`.  
7. `ADD COLUMN` for `products.store_id` (used by migration `011`, column creation not in committed SQL).  
8. `Pricing.tsx`, `Testimonials.tsx`, and `InteractiveDemo.tsx` are **not imported by any file under `src/`** (dead relative to the running SPA).

---

*End of architecture audit. Prefer the Canvas for a navigable overview; use this file as the deep study guide.*
