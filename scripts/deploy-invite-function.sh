#!/usr/bin/env bash
# Deploy claim-employee-signup (Supabase account login only).
#
# One-time: supabase login
# Set secret (Turnstile server verify): npm run setup:secrets  (or scripts/setup-supabase-secrets.sh)
# Then:     bash scripts/deploy-invite-function.sh
# Or:       npm run deploy:functions

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v supabase >/dev/null 2>&1; then
  SUPABASE=(supabase)
else
  SUPABASE=(npx supabase)
fi

if [ -f .env ]; then
  set -a
  # shellcheck source=/dev/null
  source .env
  set +a
fi

URL="${VITE_SUPABASE_URL:-}"
if [ -z "$URL" ]; then
  echo "Error: VITE_SUPABASE_URL not set in .env"
  exit 1
fi

REF="$(echo "$URL" | sed -E 's|https?://([^.]+)\.supabase\.co/?.*|\1|')"
if [ -z "$REF" ] || [ "$REF" = "$URL" ]; then
  echo "Error: Could not parse project ref from VITE_SUPABASE_URL=$URL"
  exit 1
fi

echo "Project ref (from .env): $REF"
echo ""

if ! "${SUPABASE[@]}" projects list >/dev/null 2>&1; then
  echo "Not logged in to Supabase CLI. Run once:"
  echo "  supabase login"
  echo ""
  exit 1
fi

echo "Deploying claim-employee-signup..."
"${SUPABASE[@]}" functions deploy claim-employee-signup --project-ref "$REF"
echo ""
echo "Done. Dashboard → Edge Functions → claim-employee-signup"
