# Deploy to techtostore.com

## Option 1: Vercel (recommended)

### 1. Push your code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub)
2. Click **Add New** → **Project**
3. Import your repository
4. Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** (leave empty)
5. Add environment variables (Settings → Environment Variables):
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase publishable key
6. Click **Deploy**

### 3. Add your domain

1. In your Vercel project → **Settings** → **Domains**
2. Add `techtostore.com` and `www.techtostore.com`
3. Vercel will show DNS records to add

### 4. Update DNS at your domain registrar

Where you bought techtostore.com (GoDaddy, Namecheap, Google Domains, etc.):

**For root domain (techtostore.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21` (Vercel's IP)

**For www (www.techtostore.com):**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

(Vercel may show different values – use what they display.)

### 5. Wait for DNS propagation

Usually 5–30 minutes. Vercel will issue an SSL certificate automatically.

---

## Option 2: Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. **Add new site** → **Import an existing project** → connect GitHub
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. Deploy, then add your domain in **Domain settings**

---

## 6. Update Supabase redirect URLs (for auth)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/iyubmgzxypcanrbyuyck) → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs:**
   - `https://techtostore.com/**`
   - `https://www.techtostore.com/**`

---

## 7. Add environment variables (required)

**If your deployed site shows a blank page**, you need to add these in Vercel:

1. Vercel project → **Settings** → **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = `https://iyubmgzxypcanrbyuyck.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your Supabase publishable key
3. Redeploy (Deployments → ... → Redeploy)

---

## GitHub Pages (if using the Deploy workflow)

1. **Enable GitHub Pages from Actions:**
   - Repo → **Settings** → **Pages**
   - Under "Build and deployment", set **Source** to **"GitHub Actions"**
   - (If it stays on "Deploy from a branch", the Actions deploy will not be used and you'll get 404)

2. **Add repository secrets** (Settings → Secrets and variables → Actions):
   - `VITE_SUPABASE_URL` = `https://iyubmgzxypcanrbyuyck.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your Supabase publishable key

3. Push to `main` – the workflow will build and deploy

4. Site will be at: `https://mnaarob.github.io/tts/`

---

## After deployment

- Your app will be live at techtostore.com
- Camera/barcode scanning will work over HTTPS
- Supabase auth and inventory will work as before
