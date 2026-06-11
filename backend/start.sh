#!/bin/sh
set -e

DATA_DIR="${DATA_DIR:-/data}"
mkdir -p "$DATA_DIR/uploads" "$DATA_DIR/models"

# Seed volume from image-baked models on first boot
if [ ! -f "$DATA_DIR/models/colorization_release_v2.caffemodel" ]; then
  if [ -f "/app/models/colorization_release_v2.caffemodel" ]; then
    cp /app/models/* "$DATA_DIR/models/" 2>/dev/null || true
  fi
fi

export DATA_DIR
export UPLOAD_DIR="$DATA_DIR/uploads"
export MODELS_DIR="$DATA_DIR/models"
export DATABASE_URL="sqlite+aiosqlite:///${DATA_DIR}/recolnet.db"

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
