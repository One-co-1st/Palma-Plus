#!/usr/bin/env bash
# Deploy PALMA to production and keep palma-rouge.vercel.app honest.
#
# palma-rouge.vercel.app is a pinned alias: `vercel deploy --prod` promotes the
# project's automatic domains (palma-seven-eta.vercel.app) but does NOT move a
# pinned alias, so the public URL silently strands on an old deployment. This
# wrapper deploys, then re-points palma-rouge.vercel.app at the deployment it
# just made. Run it instead of bare `vercel deploy --prod`, always.
set -euo pipefail

ALIAS="palma-rouge.vercel.app"

OUT=$(vercel deploy --prod --yes 2>&1 | tee /dev/stderr)
URL=$(echo "$OUT" | grep -oE 'https://[a-z0-9-]+-longhaul1\.vercel\.app' | head -1)
[ -n "$URL" ] || { echo "Could not read the deployment URL from the output." >&2; exit 1; }

DEP=$(vercel inspect "$URL" 2>/dev/null | grep -oE 'dpl_[A-Za-z0-9]+' | head -1)
[ -n "$DEP" ] || { echo "Could not resolve the deployment id for $URL." >&2; exit 1; }

: "${VERCEL_TOKEN:?VERCEL_TOKEN must be set (see ~/.bashrc on the box)}"

curl -sf -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"alias\":\"$ALIAS\"}" \
  "https://api.vercel.com/v2/deployments/$DEP/aliases${VERCEL_TEAM_ID:+?teamId=$VERCEL_TEAM_ID}" > /dev/null

echo "Aliased: https://$ALIAS -> $DEP"
