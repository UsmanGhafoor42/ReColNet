#!/usr/bin/env python3
"""CLI wrapper — also invoked by Vercel installCommand."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.model_download import download_models


def main() -> None:
    path = download_models()
    print("ok:", path)


if __name__ == "__main__":
    main()
