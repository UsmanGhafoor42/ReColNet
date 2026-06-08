#!/usr/bin/env python3
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODELS = ROOT / "models"
BASE = "https://raw.githubusercontent.com/richzhang/colorization/caffe/colorization"

URLS = {
    "colorization_deploy_v2.prototxt": f"{BASE}/models/colorization_deploy_v2.prototxt",
    "pts_in_hull.npy": f"{BASE}/resources/pts_in_hull.npy",
    "colorization_release_v2.caffemodel": (
        "https://www.dropbox.com/s/dx0qvhhp5hbcx7z/colorization_release_v2.caffemodel?dl=1"
    ),
}


def main() -> None:
    MODELS.mkdir(parents=True, exist_ok=True)
    for name, url in URLS.items():
        dest = MODELS / name
        if dest.exists():
            print("skip", name)
            continue
        print("get", name)
        urllib.request.urlretrieve(url, dest)
    print("ok:", MODELS)


if __name__ == "__main__":
    main()
