# =========================
# FastAPI + Next.js
# =========================

FROM python:3.10-slim

# -------------------------
# Install Node.js 20
# -------------------------
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# -------------------------
# Set root working directory
# -------------------------
WORKDIR /app

# -------------------------
# Backend
# -------------------------
COPY backend/ ./backend/

RUN pip install --no-cache-dir -r backend/requirements.txt

# -------------------------
# Frontend
# -------------------------
COPY frontend/ ./frontend/

WORKDIR /app/frontend

RUN npm install
RUN npm run build

# -------------------------
# Render uses one public port
# -------------------------
EXPOSE 3000

# -------------------------
# Start FastAPI + Next.js
# -------------------------
WORKDIR /app

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port 8000 & cd /app/frontend && npm start"]