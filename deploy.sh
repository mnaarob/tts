#!/bin/bash
set -e

echo "▶ Building and deploying to Vercel..."
OUTPUT=$(npx vercel --prod --yes 2>&1)
echo "$OUTPUT"

# Extract the production deployment URL
DEPLOY_URL=$(echo "$OUTPUT" | grep -oE 'https://tts-[a-z0-9]+-mnaarob-2976s-projects\.vercel\.app' | head -1)

if [ -z "$DEPLOY_URL" ]; then
  echo "⚠ Could not extract deployment URL. Skipping domain alias."
  exit 0
fi

echo ""
echo "▶ Pointing techtostore.com → $DEPLOY_URL"
npx vercel alias "$DEPLOY_URL" techtostore.com
npx vercel alias "$DEPLOY_URL" www.techtostore.com

echo ""
echo "✓ Done! https://techtostore.com is live."
