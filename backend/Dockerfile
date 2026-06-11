FROM python:3.11-slim-bookworm

WORKDIR /app

# OpenCV runtime libraries + ffmpeg for video audio mux
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY scripts ./scripts
COPY start.sh ./start.sh
RUN chmod +x start.sh

# Bake OpenCV DNN weights into the image (~123 MB)
RUN python -c "from app.services.model_download import download_models; download_models()"

ENV DATA_DIR=/data
ENV PORT=8000
ENV COLORIZE_ENGINE=opencv

EXPOSE 8000

CMD ["./start.sh"]
