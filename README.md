# ReColNet

Free AI colorization — no login. SQLite, no Docker.

## Setup

```bash
cd backend
source .venv/bin/activate
./scripts/setup.sh
./run.sh
```

Or step by step:

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
python scripts/download_models.py
cp .env.example .env
./run.sh
```

Frontend:

```bash
cd frontend
npm i
npm run dev
```

**Note:** In zsh, do not paste comments after commands. Run `python scripts/download_models.py` on its own line.

## Colorization

| Engine | How |
|--------|-----|
| OpenCV DNN | Default after `download_models.py` |
| DeOldify | Optional: `requirements-deoldify.txt` + `COLORIZE_ENGINE=deoldify` |

Stuck on `pending`? Open History → **Reprocess**, or `POST /api/v1/projects/{id}/reprocess`.

## API

- http://localhost:8000/docs
- http://localhost:3000
