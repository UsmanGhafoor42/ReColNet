#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

python3 -m venv .venv 2>/dev/null || true
source .venv/bin/activate

pip install -r requirements.txt
python scripts/download_models.py

if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "Setup done. Start API: ./run.sh"
