"""DeOldify when installed; OpenCV DNN colorization otherwise."""
import logging
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)

_colorizer = None
_net = None


def _cv2():
    import cv2

    return cv2


def _np():
    import numpy as np

    return np


def _pil():
    from PIL import Image

    return Image


def _ensure_opencv_models() -> bool:
    global _net
    if _net is not None:
        return True
    cv2 = _cv2()
    np = _np()
    settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    prototxt = settings.MODELS_DIR / "colorization_deploy_v2.prototxt"
    caffemodel = settings.MODELS_DIR / "colorization_release_v2.caffemodel"
    pts = settings.MODELS_DIR / "pts_in_hull.npy"
    if not all(p.exists() for p in (prototxt, caffemodel, pts)):
        try:
            from app.services.model_download import download_models

            download_models(settings.MODELS_DIR)
        except Exception as exc:
            logger.warning("Could not download OpenCV models: %s", exc)
        if not all(p.exists() for p in (prototxt, caffemodel, pts)):
            logger.warning("OpenCV models missing. Run: python scripts/download_models.py")
            return False
    net = cv2.dnn.readNetFromCaffe(str(prototxt), str(caffemodel))
    hull = np.load(str(pts)).transpose().reshape(2, 313, 1, 1)
    net.getLayer(net.getLayerId("class8_ab")).blobs = [hull.astype(np.float32)]
    net.getLayer(net.getLayerId("conv8_313_rh")).blobs = [
        np.full([1, 313], 2.606, np.float32)
    ]
    _net = net
    return True


def _opencv_colorize(src: Path, dst: Path) -> dict:
    cv2 = _cv2()
    np = _np()
    if not _ensure_opencv_models():
        raise RuntimeError("OpenCV models missing. Run: python scripts/download_models.py")

    frame = cv2.imread(str(src))
    if frame is None:
        raise ValueError("Could not read image")
    if len(frame.shape) == 2:
        frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)

    img_rgb = (frame[:, :, ::-1] / 255.0).astype(np.float32)
    img_lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2Lab)
    img_l = img_lab[:, :, 0]
    h_orig, w_orig = img_rgb.shape[:2]

    img_rs = cv2.resize(img_rgb, (224, 224))
    img_l_rs = cv2.cvtColor(img_rs, cv2.COLOR_RGB2Lab)[:, :, 0] - 50

    _net.setInput(cv2.dnn.blobFromImage(img_l_rs))
    ab_dec = _net.forward()[0, :, :, :].transpose((1, 2, 0))
    ab_dec = cv2.resize(ab_dec, (w_orig, h_orig))
    img_lab_out = np.concatenate((img_l[:, :, np.newaxis], ab_dec), axis=2)
    img_bgr = np.clip(cv2.cvtColor(img_lab_out, cv2.COLOR_Lab2BGR), 0, 1)
    cv2.imwrite(str(dst), (255 * img_bgr).astype("uint8"))
    return {"engine": "opencv-dnn", "confidence": 0.82}


def _deoldify_colorize(src: Path, dst: Path) -> dict:
    global _colorizer
    Image = _pil()
    np = _np()
    from deoldify import device as deoldify_device
    from deoldify.device_id import DeviceId
    from deoldify.visualize import get_image_colorizer

    if _colorizer is None:
        try:
            deoldify_device.set(device=DeviceId.GPU0)
        except Exception:
            deoldify_device.set(device=DeviceId.CPU)
        _colorizer = get_image_colorizer(artistic=settings.DEOLDIFY_ARTISTIC)

    result = _colorizer.get_transformed_image(
        str(src),
        render_factor=settings.DEOLDIFY_RENDER_FACTOR,
        watermarked=False,
    )
    if isinstance(result, Image.Image):
        result.save(dst)
    else:
        Image.fromarray(np.array(result)).save(dst)
    return {"engine": "deoldify", "confidence": 0.91}


def _pillow_grayscale_boost(src: Path, dst: Path) -> dict:
    Image = _pil()
    np = _np()
    arr = np.array(Image.open(src).convert("L"))
    color = Image.fromarray(
        np.stack(
            [arr, np.clip(arr * 1.05, 0, 255), np.clip(arr * 0.95, 0, 255)],
            axis=-1,
        ).astype(np.uint8)
    )
    color.save(dst)
    return {"engine": "fallback", "confidence": 0.45}


def extract_video_frame(video_path: Path, frame_path: Path) -> None:
    cv2 = _cv2()
    cap = cv2.VideoCapture(str(video_path))
    ok, frame = cap.read()
    cap.release()
    if not ok:
        raise ValueError("Could not read video frame")
    cv2.imwrite(str(frame_path), frame)


def colorize_image(src: Path, dst: Path) -> dict:
    engine = settings.COLORIZE_ENGINE.lower()
    if engine in ("deoldify", "auto"):
        try:
            return _deoldify_colorize(src, dst)
        except Exception as e:
            logger.info("DeOldify unavailable (%s), using OpenCV", e)
            if engine == "deoldify":
                raise
    try:
        return _opencv_colorize(src, dst)
    except Exception as e:
        logger.warning("OpenCV failed (%s), fallback", e)
        return _pillow_grayscale_boost(src, dst)
