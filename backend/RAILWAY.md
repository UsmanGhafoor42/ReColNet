# Deploy ReColNet backend on Railway

Railway runs the full FastAPI stack with OpenCV DNN colorization (same as local), persistent uploads, and a SQLite database on a mounted volume.

## Prerequisites

- GitHub repo pushed with the `backend/` folder
- [Railway account](https://railway.app)
- Frontend on Vercel (or elsewhere)

## 1. Create the Railway project

1. Go to [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo**
2. Select **ReColNet**
3. In service **Settings → General → Root Directory**, set:
   ```
   backend
   ```
4. Railway detects `railway.toml` and builds with the Dockerfile (~3–5 min first deploy; downloads OpenCV models during image build).

## 2. Add persistent storage (recommended)

Without a volume, uploads and the DB are lost on redeploy.

1. Service → **Volumes** → **Add Volume**
2. Mount path: `/data`
3. Size: **1 GB** (enough for models + uploads)

The app automatically uses `/data` for uploads, models, and `recolnet.db` when `RAILWAY_ENVIRONMENT` is set.

## 3. Environment variables

In Railway → **Variables**, add:

| Variable | Value |
|----------|--------|
| `CORS_ORIGINS` | `["https://re-col-net.vercel.app","http://localhost:3000"]` |
| `COLORIZE_ENGINE` | `opencv` |
| `DATA_DIR` | `/data` |

Railway sets `PORT` and `RAILWAY_ENVIRONMENT` automatically — do not override them.

Optional (after first deploy, copy your public URL):

| Variable | Example |
|----------|---------|
| `RAILWAY_PUBLIC_DOMAIN` | (auto) e.g. `recolnet-api-production.up.railway.app` |

## 4. Generate a public URL

1. **Settings → Networking → Generate Domain**
2. Note the URL, e.g. `https://recolnet-api-production.up.railway.app`

## 5. Verify the backend

```bash
curl https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/v1/health
```

Expected:

```json
{
  "status": "ok",
  "service": "recolnet-api",
  "engine": "opencv",
  "models_ready": true
}
```

If `models_ready` is `false`, check deploy logs — the first boot downloads ~123 MB to the volume (may take 1–2 minutes).

## 6. Point the frontend to Railway

In **Vercel** (frontend project) → **Settings → Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/v1
```

Redeploy the frontend, then upload a new image and open **History**.

You should see **Model: opencv-dnn · Confidence: 82%** and a fully colorized result.

## Local Docker test (optional)

From the repo root:

```bash
cd backend
docker build -t recolnet-api .
docker run --rm -p 8000:8000 -e CORS_ORIGINS='["http://localhost:3000"]' recolnet-api
curl http://localhost:8000/api/v1/health
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error in browser | Set `CORS_ORIGINS` with your exact frontend URL (include `https://`) |
| `models_ready: false` | Attach volume at `/data`, redeploy; check logs for model download |
| Upload works but no color | Confirm health shows `models_ready: true`; reprocess the job |
| Old Vercel backend still used | Update `NEXT_PUBLIC_API_URL` on Vercel and redeploy frontend |

## Cost note

Railway Hobby includes a monthly usage credit. The Docker image + OpenCV models need a service with enough memory (recommend **512 MB–1 GB** in service settings if cold starts are slow).
