#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
exec uvicorn app.main:app --reload \
  --reload-dir app \
  --reload-exclude '.venv' \
  --reload-exclude 'uploads' \
  --reload-exclude 'models' \
  --host 0.0.0.0 --port 8000
