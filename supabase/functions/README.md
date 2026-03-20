# Edge Functions

## `invite-employee`

Sends team invites: verifies the caller is `owner` or `manager` for the store, invites the email via Auth Admin (or links an existing user), then inserts `store_admins`.

### Deploy

1. Install Node/npm (or [Supabase CLI](https://supabase.com/docs/guides/cli) globally).
2. Log in once (opens browser): `npx supabase login`
3. From the repo root (with `VITE_SUPABASE_URL` in `.env`):
   ```bash
   npm run deploy:functions
   ```
   This runs `supabase functions deploy invite-employee --project-ref <parsed from .env>` — **no database password or `supabase link` required**.

Alternatively:
```bash
npx supabase functions deploy invite-employee --project-ref YOUR_PROJECT_REF
```

### Secrets (optional)

- **`INVITE_REDIRECT_URL`** — Where users land after accepting the invite (e.g. `https://techtostore.com/#/login`). Add the same URL under **Authentication → URL configuration → Redirect URLs** in the Supabase dashboard.

Auto-provided by Supabase (do not commit): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Set optional secret:

```bash
supabase secrets set INVITE_REDIRECT_URL=https://your-domain.com/#/login
```

### Verify

In the dashboard: **Edge Functions** → `invite-employee` should appear after deploy. If the app still errors, confirm `VITE_SUPABASE_URL` in Vercel matches this project.
