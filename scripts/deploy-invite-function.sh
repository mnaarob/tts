#!/usr/bin/env bash
# Deploy invite-employee Edge Function (no DB password needed — only Supabase account login).
#
# One-time: npx supabase login
# Then:     bash scripts/deploy-invite-function.sh
# Or:       npm run deploy:functions

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

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

if ! npx supabase projects list >/dev/null 2>&1; then
  echo "Not logged in. Run once:"
  echo "  npx supabase login"
  echo ""
  exit 1
fi

echo "Deploying invite-employee..."
npx supabase functions deploy invite-employee --project-ref "$REF"
echo ""
echo "Done. Dashboard → Edge Functions → invite-employee"
