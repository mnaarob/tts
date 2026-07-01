# Tech to Store

Website and cloud inventory for Canadian retailers. Live site: [techtostore.com](https://www.techtostore.com).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Turnstile site key
npm run dev
```

## Publish changes

```bash
git add .
git commit -m "Your message"
git push origin main
npm run deploy
```

Production is hosted on Vercel. `git push` alone may not update the live site unless Vercel Git integration is enabled; `npm run deploy` always publishes to production.

## Secrets

Never commit `.env`, `.env.local`, or API keys. Run `npm run check-secrets` before pushing.

Database schema changes go in `supabase/migrations/` (safe to commit; no secrets in SQL files).
