# Edge Functions

## `invite-employee`

Sends team invites: verifies the caller is `owner` or `manager` for the store, invites the email via Auth Admin (or links an existing user), then inserts `store_admins`.

### Deploy

1. Install [Supabase CLI](https://supabase.com/docs/guides/cli) and log in: `supabase login`
2. Link this repo to your project: `supabase link --project-ref <YOUR_PROJECT_REF>`
3. Deploy:
   ```bash
   supabase functions deploy invite-employee
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
