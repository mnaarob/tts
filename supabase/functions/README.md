# Edge Functions

## `claim-employee-signup`

Public **POST** (no JWT). Employees register with store name, Employee ID (from pending `store_invites`), email, and password. Uses the service role to create a confirmed Auth user, insert `store_admins`, and delete the invite row.

### Deploy

From the repo root (with `VITE_SUPABASE_URL` in `.env`):

```bash
npm run deploy:functions
```

Or:

```bash
npx supabase functions deploy claim-employee-signup --project-ref YOUR_PROJECT_REF
```

### Database

Run migrations through **`008_invites_no_email.sql`** and **`009_team_invite_name_email.sql`** in the SQL Editor (`store_invites.full_name`, `store_admins.display_name`, email-bound invites, updated `get_store_team`).

### Secrets

Auto-provided: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

**`TURNSTILE_SECRET_KEY`** (optional but recommended for production): same secret as in Supabase Auth → CAPTCHA / Cloudflare Turnstile. When set, the function verifies the `captchaToken` from the client with Cloudflare’s siteverify API.

```bash
supabase secrets set TURNSTILE_SECRET_KEY=your_secret --project-ref YOUR_PROJECT_REF
```

Without `TURNSTILE_SECRET_KEY`, CAPTCHA is not verified server-side (development only).

### Team flow

Managers add an employee in **Inventory → Team** (generates Employee ID + `store_invites` row). The employee signs up at **`/#/signup`** with store name, ID, email, and password.
