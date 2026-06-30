#!/usr/bin/env bash
# Push server-side secrets to Supabase Edge Functions from local .env.local.
# TURNSTILE_SECRET_KEY is NOT in git — add it to .env.local from:
#   Cloudflare Dashboard → Turnstile → your widget → Secret key
# (same value as Supabase Dashboard → Auth → Bot and Abuse Protection)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${1:-.env.local}"
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — copy .env.example to .env.local and add TURNSTILE_SECRET_KEY."
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

URL="${VITE_SUPABASE_URL:-}"
REF="$(echo "$URL" | sed -E 's|https?://([^.]+)\.supabase\.co/?.*|\1|')"
if [ -z "$REF" ] || [ "$REF" = "$URL" ]; then
  echo "Error: VITE_SUPABASE_URL missing or invalid in $ENV_FILE"
  exit 1
fi

ORIGINS="${ALLOWED_ORIGINS:-https://techtostore.com,https://www.techtostore.com,http://localhost:5173}"
echo "Setting ALLOWED_ORIGINS on project $REF..."
supabase secrets set "ALLOWED_ORIGINS=$ORIGINS" --project-ref "$REF"

if [ -n "${TURNSTILE_SECRET_KEY:-}" ]; then
  echo "Setting TURNSTILE_SECRET_KEY..."
  supabase secrets set "TURNSTILE_SECRET_KEY=$TURNSTILE_SECRET_KEY" --project-ref "$REF"
  echo "Done — employee signup edge function will verify CAPTCHA server-side."
else
  echo ""
  echo "TURNSTILE_SECRET_KEY not set in $ENV_FILE."
  echo "Add it (from Cloudflare Turnstile / Supabase Auth CAPTCHA settings), then re-run:"
  echo "  bash scripts/setup-supabase-secrets.sh"
  exit 1
fi
