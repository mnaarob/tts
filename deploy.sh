#!/bin/bash
set -e
# Vercel project: techtostore (prj_p7mOCE0ObenFaMirPaSAdvp6LfIu) — production domain: techtostore.com
# Requires .vercel/project.json (run: npx vercel link --yes --scope mnaarob-2976s-projects --project prj_p7mOCE0ObenFaMirPaSAdvp6LfIu)

echo "▶ Building and deploying to Vercel..."
OUTPUT=$(npx vercel --prod --yes 2>&1)
echo "$OUTPUT"

# Extract the production deployment URL (hostname pattern varies, e.g. techtostore-*-*.vercel.app)
DEPLOY_URL=$(echo "$OUTPUT" | grep -oE 'Production: https://[^ ]+\.vercel\.app' | head -1 | sed 's/Production: //')

if [ -z "$DEPLOY_URL" ]; then
  echo "⚠ Could not extract deployment URL. Skipping domain alias."
  exit 0
fi

echo ""
echo "▶ Optional: assign custom domains (Vercel often aliases www automatically)"
if npx vercel alias "$DEPLOY_URL" techtostore.com; then
  echo "  ✓ techtostore.com → deployment"
else
  echo "  ⚠ Apex alias skipped (no CLI access to techtostore.com — set in Vercel → Domains if needed)."
fi
if npx vercel alias "$DEPLOY_URL" www.techtostore.com; then
  echo "  ✓ www.techtostore.com → deployment"
else
  echo "  ⚠ www alias skipped (may already be assigned by Vercel)."
fi

echo ""
echo "✓ Production deploy complete: $DEPLOY_URL"
