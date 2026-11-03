#!/usr/bin/env bash
# One-time setup for lesson clips (content/learn/MEDIA.md). Creates the
# private bucket the site signs short-lived links to, lets the browser load
# caption tracks from it (CORS), and lets the Cloud Run service sign links.
# Run on your Mac, signed in to gcloud as the project owner:
#
#   website/scripts/learn/setup-learn-video-bucket.sh
#
# Then add LEARN_VIDEO_BUCKET=<bucket> to the deploy env (deploy-production.yml).
# Until that variable is set, production shows no video players at all.
set -euo pipefail

PROJECT="${GCP_PROJECT:-apexleader-prod}"
REGION="${GCP_REGION:-us-central1}"
SERVICE="${SERVICE:-apexleader-ai}"
BUCKET="${LEARN_VIDEO_BUCKET:-fromaitobusiness-learn-video}"
ORIGINS='["https://fromaitobusiness.com","https://www.fromaitobusiness.com","http://localhost:3000"]'

echo "Project $PROJECT, bucket gs://$BUCKET"
if ! gcloud storage buckets describe "gs://$BUCKET" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud storage buckets create "gs://$BUCKET" --project="$PROJECT" --location="$REGION" \
    --uniform-bucket-level-access --public-access-prevention
fi

cors="$(mktemp)"
cat >"$cors" <<JSON
[{"origin": $ORIGINS, "method": ["GET", "HEAD"], "responseHeader": ["Content-Type", "Content-Range", "Accept-Ranges"], "maxAgeSeconds": 3600}]
JSON
gcloud storage buckets update "gs://$BUCKET" --cors-file="$cors"
rm -f "$cors"

SA="$(gcloud run services describe "$SERVICE" --project="$PROJECT" --region="$REGION" --format='value(spec.template.spec.serviceAccountName)')"
if [[ -z "$SA" ]]; then
  SA="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')-compute@developer.gserviceaccount.com"
fi
echo "Cloud Run runs as $SA"
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" --member="serviceAccount:$SA" --role="roles/storage.objectViewer" >/dev/null
# Signing a link on Cloud Run goes through IAM signBlob on the service's own account.
gcloud iam service-accounts add-iam-policy-binding "$SA" --project="$PROJECT" \
  --member="serviceAccount:$SA" --role="roles/iam.serviceAccountTokenCreator" >/dev/null
echo "Done. Upload clips with: gcloud storage rsync --recursive public/learn/video gs://$BUCKET/learn/video"
