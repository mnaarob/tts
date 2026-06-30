#!/usr/bin/env bash
# Fail if staged files look like secrets or env files that should stay local.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STAGED="$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true)"
if [ -z "$STAGED" ]; then
  exit 0
fi

FAIL=0

while IFS= read -r file; do
  base="$(basename "$file")"
  case "$base" in
    .env|.env.local|.env.production|.env.development|.env.staging|.env.test)
      echo "error: refusing to commit env file: $file"
      FAIL=1
      ;;
    .env.*.local)
      echo "error: refusing to commit env file: $file"
      FAIL=1
      ;;
  esac
  if [ "$base" != ".env.example" ] && [[ "$base" == .env.* ]]; then
    echo "error: refusing to commit env file: $file (use .env.example for templates)"
    FAIL=1
  fi
done <<< "$STAGED"

# JWT-like service keys / Turnstile secrets in staged content (not placeholders)
while IFS= read -r file; do
  [ -f "$file" ] || continue
  if git diff --cached -- "$file" | rg -q '^\+\s*(VITE_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|TURNSTILE_SECRET_KEY)\s*=\s*[^\s#]+' \
    && ! git diff --cached -- "$file" | rg -q 'your-|placeholder|example|here'; then
    if git diff --cached -- "$file" | rg -q '^\+\s*(VITE_SUPABASE_ANON_KEY|TURNSTILE_SECRET_KEY)\s*=\s*$'; then
      continue
    fi
    if git diff --cached -- "$file" | rg -q '^\+\s*VITE_SUPABASE_ANON_KEY\s*=\s*eyJ'; then
      echo "error: staged Supabase key looks real in $file"
      FAIL=1
    fi
    if git diff --cached -- "$file" | rg -q '^\+\s*(SUPABASE_SERVICE_ROLE_KEY|TURNSTILE_SECRET_KEY)\s*=\s*\S'; then
      echo "error: staged secret in $file — service role and Turnstile secret must not be committed"
      FAIL=1
    fi
  fi
done <<< "$STAGED"

if [ "$FAIL" -ne 0 ]; then
  echo ""
  echo "Remove sensitive files from the commit. Use .env.local locally and GitHub/Vercel secrets in CI."
  exit 1
fi

exit 0
