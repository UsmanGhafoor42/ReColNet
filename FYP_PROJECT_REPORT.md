# ReColNet — Final Year Project Technical Report

**Project Title:** ReColNet — AI-Powered Image & Video Colorization Platform  
**Document Type:** FYP Technical Documentation  
**Version:** 1.0  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Introduction & Problem Statement](#2-introduction--problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [AI Models & Colorization Engines](#6-ai-models--colorization-engines)
7. [Image Colorization — How It Works](#7-image-colorization--how-it-works)
8. [Video Colorization — How It Works](#8-video-colorization--how-it-works)
9. [Backend API & Services](#9-backend-api--services)
10. [Frontend Application](#10-frontend-application)
11. [Database Design](#11-database-design)
12. [Project Workflow (End-to-End)](#12-project-workflow-end-to-end)
13. [Deployment Architecture](#13-deployment-architecture)
14. [Local Development Setup](#14-local-development-setup)
15. [Environment Variables Reference](#15-environment-variables-reference)
16. [Limitations & Future Work](#16-limitations--future-work)
17. [Conclusion](#17-conclusion)
18. [References](#18-references)

---

## 1. Executive Summary

**ReColNet** is a full-stack web application that transforms grayscale (black-and-white) photographs and video footage into realistic color using deep learning. The system provides an upload-first workflow with no user authentication required, making it accessible for restoring family archives, historical photographs, and legacy video content.

The platform consists of:

- A **Next.js 15** frontend hosted on Vercel
- A **FastAPI** Python backend deployed on Railway (production) with OpenCV DNN colorization
- **SQLite** for lightweight project and metadata storage
- Support for **images** (JPEG, PNG, WebP, AVIF, BMP, TIFF) and **videos** (MP4, MOV, WebM, AVI)

The primary colorization engine is **OpenCV DNN** using the pre-trained **Colorful Image Colorization** model (Zhang, Isola, Efros — ECCV 2016), which predicts chrominance (a/b channels) in LAB color space from luminance. An optional **DeOldify** engine can be enabled for higher-quality artistic colorization when GPU resources and additional dependencies are available.

---

## 2. Introduction & Problem Statement

Historical photographs and early film footage are predominantly stored in grayscale. Manual colorization is time-consuming and requires expert knowledge of period-accurate colors. Recent advances in convolutional neural networks (CNNs) enable automated, plausible color prediction from luminance alone.

**Problem:** Existing colorization tools often focus only on still images, use oversaturated “AI startup” aesthetics, or require complex desktop software. Users need a simple web-based tool that:

1. Accepts both **photos and videos**
2. Produces **natural, realistic** color output
3. Provides **before/after comparison** and downloadable results
4. Runs reliably without requiring GPU on the server (with optional GPU acceleration)

**Solution:** ReColNet delivers a modern SaaS-style web interface backed by a production-ready API that processes uploads asynchronously and stores results for history, reprocessing, and download.

---

## 3. Project Objectives

| Objective | Implementation |
|-----------|----------------|
| Automate grayscale → color conversion | OpenCV DNN + optional DeOldify |
| Support image and video inputs | Frame-by-frame video pipeline with ffmpeg |
| Provide intuitive web UI | Next.js dashboard with upload, history, compare |
| Track processing metadata | AI results (engine, confidence, time) + explanations |
| Enable local and cloud deployment | Docker/Railway backend, Vercel frontend |
| No login barrier | Open API; SQLite per-deployment storage |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│  (Landing page, Upload, History, Before/After sliders)          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST (JSON + multipart)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Frontend — Next.js 15 (Vercel)                      │
│  NEXT_PUBLIC_API_URL → Railway / localhost:8000/api/v1          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend — FastAPI (Railway / local)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ REST API     │  │ Background   │  │ Colorization Engine  │  │
│  │ /projects    │→ │ Jobs         │→ │ OpenCV DNN / DeOldify│  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                                    │                   │
│         ▼                                    ▼                   │
│  ┌──────────────┐                   ┌──────────────────────┐  │
│  │ SQLite DB    │                   │ File Storage          │  │
│  │ (projects,   │                   │ uploads/projects/{id}/│  │
│  │  ai_results) │                   │ original + colorized  │  │
│  └──────────────┘                   └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Asynchronous processing:** Upload returns immediately; colorization runs in FastAPI `BackgroundTasks` so the UI can poll status.
- **Engine fallback chain:** `auto` → try DeOldify → OpenCV DNN → Pillow luminance tint (last resort).
- **Production engine:** `COLORIZE_ENGINE=opencv` on Railway for stability and predictable CPU usage.
- **Static media serving:** Processed files are served at `/media/projects/{id}/...` via FastAPI `StaticFiles`.

---

## 5. Technology Stack

### 5.1 Backend (Python)

| Library | Version | Purpose |
|---------|---------|---------|
| **FastAPI** | 0.115.6 | REST API framework, async endpoints, OpenAPI docs |
| **Uvicorn** | 0.34.0 | ASGI server |
| **SQLAlchemy** | 2.0.36 | ORM and async database access |
| **aiosqlite** | 0.20.0 | Async SQLite driver |
| **Pydantic** | 2.10.3 | Request/response validation |
| **pydantic-settings** | 2.7.0 | Environment-based configuration |
| **python-multipart** | 0.0.20 | File upload handling |
| **aiofiles** | 24.1.0 | Async file I/O |
| **opencv-python-headless** | 4.10.0.84 | DNN inference, image/video I/O |
| **NumPy** | 1.26.4 | Array operations for LAB merge |
| **Pillow** | 11.0.0 | Image loading/saving, AVIF decode |
| **pillow-avif-plugin** | 1.5.2 | AVIF format support |

**Optional (DeOldify):**

| Library | Purpose |
|---------|---------|
| **PyTorch** | Deep learning backend |
| **torchvision** | Image transforms |
| **fastai** | DeOldify dependency |
| **DeOldify** | Artistic neural colorization (GitHub: jantic/DeOldify) |

**System dependencies (production Docker):**

| Tool | Purpose |
|------|---------|
| **ffmpeg** | H.264 re-encoding and audio muxing for video output |
| **libglib, libsm, libxext, libxrender, libgomp** | OpenCV runtime libraries |

### 5.2 Frontend (TypeScript / React)

| Library | Version | Purpose |
|---------|---------|---------|
| **Next.js** | 15.5.19 | React framework, App Router, SSR/SSG |
| **React** | 19.1.0 | UI components |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Framer Motion** | 12.x | Page animations |
| **Lucide React** | 1.x | Icons |
| **next-themes** | 0.4.x | Dark/light mode |
| **shadcn / @base-ui/react** | — | Accessible UI primitives (Button, Card, Sheet) |

### 5.3 Database

- **SQLite** via `sqlite+aiosqlite` — zero-config, file-based, suitable for FYP and single-tenant deployment.

---

## 6. AI Models & Colorization Engines

ReColNet supports three colorization modes controlled by `COLORIZE_ENGINE`:

### 6.1 OpenCV DNN (Primary — Recommended)

**Model:** Colorful Image Colorization (Zhang et al., 2016)  
**Format:** Caffe (`.prototxt` + `.caffemodel`)  
**Source:** [richzhang/colorization](https://github.com/richzhang/colorization)

**Files downloaded automatically:**

| File | Size (approx.) | Role |
|------|----------------|------|
| `colorization_deploy_v2.prototxt` | ~30 KB | Network architecture |
| `colorization_release_v2.caffemodel` | ~123 MB | Trained weights |
| `pts_in_hull.npy` | ~2 KB | Quantized ab color bins (313 clusters) |

**How it works (summary):** The network takes the **L (lightness) channel** of an image in LAB color space and predicts the **a and b chrominance channels**. The original L channel is preserved and merged with predicted ab to produce the final BGR image. This preserves structure and shading while adding plausible color.

**Confidence score (reported):** 0.82

### 6.2 DeOldify (Optional — Higher Quality)

**Model:** Generative adversarial network (GAN) based colorization  
**Repository:** [jantic/DeOldify](https://github.com/jantic/DeOldify)

- Requires PyTorch, fastai, and cloned DeOldify repo
- Supports **artistic** vs **stable** modes (`DEOLDIFY_ARTISTIC`)
- Uses `render_factor` (default 35) to control resolution/quality tradeoff
- Prefers GPU (`DeviceId.GPU0`) with CPU fallback

**Confidence score (reported):** 0.91

### 6.3 Pillow Fallback (Emergency)

If OpenCV models are missing and DeOldify is unavailable, a simple **luminance-to-RGB mapping** applies a warm cinematic tint. This is not true AI colorization but prevents total failure.

**Confidence score (reported):** 0.45

### 6.4 Engine Selection Logic

```
COLORIZE_ENGINE setting:
├── "deoldify"  → DeOldify only (fail if unavailable)
├── "opencv"    → OpenCV DNN only (fail → fallback tint)
└── "auto"      → Try DeOldify → OpenCV → fallback tint
```

**Production recommendation:** `COLORIZE_ENGINE=opencv`

---

## 7. Image Colorization — How It Works

### 7.1 Pipeline Overview

```
Upload (grayscale image)
        │
        ▼
┌───────────────────┐
│ Storage Service   │  Save as uploads/projects/{id}/original.{ext}
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Background Job    │  run_colorization_job(project_id)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ colorize_image()  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Save colorized    │  uploads/projects/{id}/colorized.png
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ DB: AIResult +    │  engine, confidence, processing_time
│     Explanation   │
└───────────────────┘
```

### 7.2 OpenCV DNN — Step-by-Step Algorithm

Implementation: `backend/app/services/colorize_engine.py` → `_opencv_colorize_frame()`

1. **Load image** as BGR via `cv2.imread()`. If single-channel grayscale, convert with `COLOR_GRAY2BGR`.

2. **Convert to RGB** and normalize to `[0, 1]` float32.

3. **Convert RGB → LAB** using OpenCV `COLOR_RGB2Lab`.

4. **Extract L channel** (lightness) — this is the input the network uses conceptually.

5. **Resize to 224×224** (network input size). Compute L channel of resized image and subtract 50 (model normalization).

6. **DNN forward pass:**
   - `net.setInput(blobFromImage(img_l_rs))`
   - Output: predicted ab channels at 224×224

7. **Resize ab prediction** back to original width/height.

8. **Merge channels:** Concatenate original L with predicted ab → full LAB image.

9. **Convert LAB → BGR**, clip to `[0, 1]`, scale to uint8 `[0, 255]`.

10. **Write output** with `cv2.imwrite()`.

### 7.3 Model Initialization

On first use (or at server startup), the system:

1. Checks for model files in `MODELS_DIR` (default: `backend/models/`)
2. Downloads missing files from GitHub/Dropbox if needed
3. Loads Caffe network with `cv2.dnn.readNetFromCaffe()`
4. Injects `pts_in_hull.npy` into layer `class8_ab` (quantization centers)
5. Sets `conv8_313_rh` bias to 2.606 (model hyperparameter)

### 7.4 Supported Image Formats

| Format | MIME Type | Notes |
|--------|-----------|-------|
| JPEG | `image/jpeg` | Native |
| PNG | `image/png` | Native |
| WebP | `image/webp` | Native |
| AVIF | `image/avif` | Converted to PNG on upload |
| BMP | `image/bmp` | Native |
| TIFF | `image/tiff` | Native |

**Max upload size:** 100 MB (configurable via `MAX_UPLOAD_SIZE_MB`)

---

## 8. Video Colorization — How It Works

Video colorization extends the image pipeline by processing **every frame independently** and reassembling an MP4.

### 8.1 Pipeline Overview

```
Upload (grayscale video)
        │
        ▼
┌───────────────────┐
│ colorize_video()  │
└─────────┬─────────┘
          │
          ├── Open VideoCapture (cv2)
          ├── Read frame loop (max MAX_VIDEO_FRAMES)
          │     └── _opencv_colorize_frame(frame) per frame
          ├── Write to temp MP4 (mp4v codec)
          └── _finalize_video() with ffmpeg
                    ├── H.264 re-encode (libx264, yuv420p)
                    └── Mux audio from original (AAC)
          │
          ▼
Output: colorized.mp4
```

### 8.2 Frame Processing

For each frame:

1. `cap.read()` → BGR numpy array
2. Same `_opencv_colorize_frame()` as images
3. `writer.write(colorized_frame)`

**Frame limit:** `MAX_VIDEO_FRAMES=1800` (~60 seconds at 30 fps). Set to `0` for unlimited (not recommended on limited CPU).

### 8.3 ffmpeg Finalization

Raw OpenCV output uses `mp4v` codec, which may not play in all browsers. `_finalize_video()` runs:

```bash
ffmpeg -y \
  -i colorized.tmp.mp4 \
  -i original.mp4 \
  -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p \
  -c:a aac \
  -map 0:v:0 -map 1:a:0? \
  -shortest \
  colorized.mp4
```

- **Video:** H.264 for universal browser support
- **Audio:** Copied from original upload (if present)
- **Fallback:** If ffmpeg is not installed, raw mp4v file is used

### 8.4 Frontend Video Comparison

The History page uses a dual **VideoCompare** component with synchronized HTML5 `<video>` players for side-by-side original vs colorized playback, plus MP4 download.

---

## 9. Backend API & Services

**Base URL:** `http://localhost:8000/api/v1` (local)  
**Interactive docs:** `http://localhost:8000/docs`

### 9.1 REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/projects` | List all projects |
| POST | `/projects` | Create project `{ title, media_type }` |
| GET | `/projects/{id}` | Project detail with media, AI results, explanations |
| POST | `/projects/{id}/upload` | Upload file (multipart); triggers colorization |
| POST | `/projects/{id}/reprocess` | Re-run colorization on existing original |
| GET | `/projects/{id}/download` | Download colorized file |
| PATCH | `/projects/{id}` | Update title/status |
| DELETE | `/projects/{id}` | Delete project and files |
| GET | `/admin/analytics` | Project counts |
| GET | `/admin/models` | Engine availability status |

### 9.2 Core Services

| Module | File | Responsibility |
|--------|------|----------------|
| **colorize_engine** | `app/services/colorize_engine.py` | Image/video AI inference |
| **jobs** | `app/services/jobs.py` | Async colorization job orchestration |
| **storage** | `app/services/storage.py` | Upload save, path resolution, AVIF normalization |
| **model_download** | `app/services/model_download.py` | Download OpenCV Caffe weights |

### 9.3 Project Status Lifecycle

```
PENDING → PROCESSING → COMPLETED
                    ↘ FAILED
```

---

## 10. Frontend Application

### 10.1 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, before/after examples, features, video showcase |
| `/upload` | Upload form — image/video toggle, drag-and-drop, progress |
| `/history` | Project list, detail view, before/after compare, download, reprocess |
| `/dashboard` | Overview stats — total/completed/in-progress projects |
| `/admin` | Analytics and model status (not linked in public nav) |

### 10.2 Key Components

| Component | Purpose |
|-----------|---------|
| `BeforeAfterSlider` | Interactive drag slider comparing grayscale vs colorized |
| `VideoCompare` | Synchronized dual video players |
| `SiteHeader` | Marketing nav with mobile sheet menu |
| `DashboardHeader` + `DashboardSidebar` | Responsive dashboard navigation |

### 10.3 Design System

- **Palette:** Neutral grays (`#FAFAFA`, `#111827`, `#6B7280`) with amber accent (`#D97706`)
- **Typography:** Geist Sans
- **Cards:** White background, subtle border, 24px radius — premium AI SaaS aesthetic

---

## 11. Database Design

### 11.1 Entity Relationship

```
Project (1) ──< (N) MediaFile
Project (1) ──< (N) AIResult
Project (1) ──< (N) Explanation
```

### 11.2 Tables

**projects**

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| title | VARCHAR(255) | User-provided name |
| media_type | ENUM | `image` or `video` |
| status | ENUM | `pending`, `processing`, `completed`, `failed` |
| created_at | DATETIME | Timestamp |
| updated_at | DATETIME | Timestamp |

**media_files**

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| project_id | FK → projects | |
| original_file | VARCHAR | URL path to original |
| colorized_file | VARCHAR | URL path to colorized output |
| file_type | ENUM | `original` or `colorized` |

**ai_results**

| Column | Type | Description |
|--------|------|-------------|
| project_id | FK | |
| model_used | VARCHAR | e.g. `opencv-dnn`, `deoldify` |
| confidence_score | FLOAT | Engine-reported confidence |
| processing_time | FLOAT | Seconds |

**explanations**

| Column | Type | Description |
|--------|------|-------------|
| project_id | FK | |
| text_explanation | TEXT | Human-readable processing summary |

---

## 12. Project Workflow (End-to-End)

1. User opens **Upload** page and selects image or video.
2. Frontend calls `POST /projects` with title and `media_type`.
3. Frontend uploads file via `POST /projects/{id}/upload`.
4. Backend saves original file, sets status `pending`, queues background job.
5. Job sets status `processing`, runs `colorize_image()` or `colorize_video()`.
6. On success: saves colorized file, records AI metadata, sets status `completed`.
7. Frontend redirects to **History** with `?watch={id}` and polls every 2 seconds.
8. User compares original vs colorized (slider or video player) and downloads result.
9. User can **Reprocess** to regenerate colorization from the same original.

---

## 13. Deployment Architecture

| Component | Platform | URL (example) |
|-----------|----------|---------------|
| Frontend | Vercel | `https://re-col-net.vercel.app` |
| Backend | Railway (Docker) | `https://recolnet-production.up.railway.app` |
| Database + uploads | Railway volume `/data` | Persistent SQLite + files |

**Why Railway for backend:** Vercel serverless has size/time limits unsuitable for OpenCV DNN (~123 MB models) and long video processing. Railway runs a persistent Docker container with ffmpeg and mounted storage.

See `backend/RAILWAY.md` for production deployment steps.

---

## 14. Local Development Setup

### 14.1 System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **OS** | macOS, Linux, or Windows (WSL) | macOS / Ubuntu 22.04+ |
| **Python** | 3.10+ | 3.11 |
| **Node.js** | 18+ | 20 LTS |
| **npm** | 9+ | 10+ |
| **RAM** | 4 GB | 8 GB+ |
| **Disk** | 2 GB free | 5 GB+ (models ~123 MB) |
| **ffmpeg** | Optional locally | Required for video audio mux |

**Optional for DeOldify:**

- NVIDIA GPU with CUDA
- PyTorch with CUDA support
- ~4 GB additional disk for weights

### 14.2 Quick Start (Recommended)

**Terminal 1 — Backend:**

```bash
cd backend
./scripts/setup.sh    # creates venv, installs deps, downloads models, copies .env
source .venv/bin/activate
./run.sh              # starts API at http://localhost:8000
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm install
cp .env.local.example .env.local   # if .env.local does not exist
npm run dev                          # starts UI at http://localhost:3000
```

Open **http://localhost:3000** in your browser.

### 14.3 Manual Setup (Step by Step)

#### Backend

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Download OpenCV colorization models (~123 MB)
python scripts/download_models.py

# 5. Configure environment
cp .env.example .env
# Edit .env as needed (see Section 15)

# 6. (Optional) Install ffmpeg for video audio
# macOS:
brew install ffmpeg
# Ubuntu:
sudo apt install ffmpeg

# 7. Start the API server
./run.sh
# Or manually:
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify backend:

- Health: http://localhost:8000/api/v1/health
- Swagger docs: http://localhost:8000/docs

#### Frontend

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install Node dependencies
npm install

# 3. Configure API URL
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1' > .env.local

# 4. Start development server
npm run dev
```

Verify frontend: http://localhost:3000

### 14.4 First Test

1. Go to **Upload** → select **Image**
2. Choose a grayscale `.jpg` or `.webp` file
3. Enter a title → click **Colorize**
4. You are redirected to **History** — wait for status `completed`
5. Compare before/after and download the colorized file

### 14.5 Troubleshooting

| Issue | Solution |
|-------|----------|
| Stuck on "Processing…" | Check backend terminal for errors; ensure models downloaded |
| `OpenCV models missing` | Run `python scripts/download_models.py` |
| CORS error in browser | Set `CORS_ORIGINS=["http://localhost:3000"]` in backend `.env` |
| Video has no audio | Install `ffmpeg` on your system |
| Upload timeout | Large videos take time; check `MAX_VIDEO_FRAMES` |
| Blue/wrong colors | Use `COLORIZE_ENGINE=opencv`; avoid broken LAB post-processing |

---

## 15. Environment Variables Reference

### 15.1 Backend (`backend/.env`)

| Variable | Default (local) | Description |
|----------|-----------------|-------------|
| `DEBUG` | `false` | SQLAlchemy query logging |
| `DATABASE_URL` | `sqlite+aiosqlite:///./recolnet.db` | Async SQLite connection string |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | JSON array of allowed frontend origins |
| `COLORIZE_ENGINE` | `auto` | `opencv`, `deoldify`, or `auto` |
| `DEOLDIFY_ARTISTIC` | `true` | Artistic vs stable DeOldify model |
| `DEOLDIFY_RENDER_FACTOR` | `35` | DeOldify quality/resolution factor |
| `DATA_DIR` | *(unset locally)* | Root for uploads/models/db on Railway |
| `UPLOAD_DIR` | `backend/uploads` | Override upload directory |
| `MODELS_DIR` | `backend/models` | OpenCV model weights directory |
| `MAX_UPLOAD_SIZE_MB` | `100` | Maximum upload file size |
| `MAX_VIDEO_FRAMES` | `1800` | Max frames to colorize (0 = unlimited) |

**Example local `.env`:**

```env
DEBUG=true
DATABASE_URL=sqlite+aiosqlite:///./recolnet.db
CORS_ORIGINS=["http://localhost:3000"]
COLORIZE_ENGINE=opencv
```

**Example Railway production:**

```env
CORS_ORIGINS=["https://re-col-net.vercel.app","http://localhost:3000"]
COLORIZE_ENGINE=opencv
DATA_DIR=/data
```

### 15.2 Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Backend API base URL |

**Production example:**

```env
NEXT_PUBLIC_API_URL=https://recolnet-production.up.railway.app/api/v1
```

---

## 16. Limitations & Future Work

### Current Limitations

1. **Per-frame video processing** — No temporal consistency; colors may flicker between frames.
2. **CPU-bound OpenCV** — Long videos are slow without GPU batching.
3. **No user accounts** — Projects are shared per deployment instance.
4. **SQLite scaling** — Not suitable for high-concurrency multi-user production.
5. **Color accuracy** — AI predicts plausible colors, not historically verified ones.
6. **DeOldify not bundled** — Requires manual install and GPU for best results.

### Future Enhancements

- Temporal consistency models for video (e.g. frame propagation)
- GPU acceleration and batch inference
- User authentication and cloud storage (S3)
- Face-aware and region-guided color hints
- Real-time progress WebSocket for long videos
- Historical palette presets (e.g. 1940s, sepia archives)

---

## 17. Conclusion

ReColNet demonstrates a complete **AI colorization pipeline** from research-grade models to a deployable web product. The system combines:

- **OpenCV DNN** for efficient, CPU-friendly LAB colorization
- **Frame-by-frame video processing** with browser-compatible H.264 output
- A **modern Next.js frontend** with before/after demonstration and project history
- **Production deployment** on Railway + Vercel with persistent storage

The project fulfills core FYP requirements: problem identification, literature-backed AI methodology, full-stack implementation, testing via real uploads, and documented local/cloud deployment procedures.

---

## 18. References

1. Zhang, R., Isola, P., Efros, A. A. (2016). *Colorful Image Colorization.* ECCV 2016.  
   GitHub: https://github.com/richzhang/colorization

2. Antic, J. (2019). *DeOldify.* GitHub: https://github.com/jantic/DeOldify

3. OpenCV Documentation — Deep Neural Networks module: https://docs.opencv.org/4.x/d2/d58/group__dnn.html

4. FastAPI Documentation: https://fastapi.tiangolo.com/

5. Next.js Documentation: https://nextjs.org/docs

---

*Document generated for ReColNet Final Year Project. For deployment details see `backend/RAILWAY.md` and root `README.md`.*
