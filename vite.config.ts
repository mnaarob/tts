import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Inject a strict Content-Security-Policy at *production build* time only.
 * In dev we leave the meta tag empty so Vite's React Refresh runtime (which
 * relies on an inline <script>) still works.
 *
 * The CSP allow-lists exactly the third-party origins this SPA talks to:
 *   - https://*.supabase.co        Supabase REST/auth/storage
 *   - wss://*.supabase.co          Supabase realtime
 *   - https://world.openfoodfacts.net  barcode product lookup
 *   - https://challenges.cloudflare.com Turnstile widget (script + iframe)
 *   - https://fonts.googleapis.com / fonts.gstatic.com  Inter font
 *
 * X-Frame-Options, Referrer-Policy, Permissions-Policy, Strict-Transport-
 * Security and HSTS must be set as real HTTP response headers by the host
 * (e.g. vercel.json `headers` block) — they cannot be delivered via <meta>.
 */
const PROD_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://world.openfoodfacts.net https://challenges.cloudflare.com",
  "frame-src 'self' https://challenges.cloudflare.com",
].join('; ')

function cspPlugin(): Plugin {
  return {
    name: 'inject-csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      const tag = `<meta http-equiv="Content-Security-Policy" content="${PROD_CSP}" />`
      return html.replace('<!-- <CSP_PLACEHOLDER> -->', tag)
    },
  }
}

export default defineConfig(() => ({
  plugins: [react(), cspPlugin()],
  base: '/',
}))
