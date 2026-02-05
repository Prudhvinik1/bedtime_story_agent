#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="bedtime-story-app:local"

echo "Building image..."
docker build -t "${IMAGE_NAME}" .

echo "Loading image into minikube..."
minikube image load "${IMAGE_NAME}"

echo "Creating secret (if missing)..."
kubectl create secret generic openai-api-key \
  --from-literal=OPENAI_API_KEY="${OPENAI_API_KEY:-}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

echo "Done. Access via: minikube service bedtime-story-api --url"
