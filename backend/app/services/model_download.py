"""Download OpenCV DNN colorization weights (used locally and on Vercel)."""
import logging
import urllib.request
from pathlib import Path
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

BASE = "https://raw.githubusercontent.com/richzhang/colorization/caffe/colorization"

MODEL_URLS = {
    "colorization_deploy_v2.prototxt": f"{BASE}/models/colorization_deploy_v2.prototxt",
    "pts_in_hull.npy": f"{BASE}/resources/pts_in_hull.npy",
    "colorization_release_v2.caffemodel": (
        "https://www.dropbox.com/s/dx0qvhhp5hbcx7z/colorization_release_v2.caffemodel?dl=1"
    ),
}


def download_models(dest: Optional[Path] = None) -> Path:
    target = dest or settings.MODELS_DIR
    target.mkdir(parents=True, exist_ok=True)
    for name, url in MODEL_URLS.items():
        path = target / name
        if path.exists() and path.stat().st_size > 0:
            continue
        logger.info("Downloading OpenCV colorization model: %s", name)
        urllib.request.urlretrieve(url, path)
    return target


def models_ready(dest: Optional[Path] = None) -> bool:
    target = dest or settings.MODELS_DIR
    return all((target / name).exists() for name in MODEL_URLS)
