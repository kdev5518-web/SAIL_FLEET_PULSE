# Multi-stage build or standard container setup for FastAPI + Next.js
FROM python:3.10-slim

WORKDIR /app

# Install Node.js for Next.js frontend build
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Copy backend files and install dependencies
COPY backend/ /app/backend/
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend files and build
WORKDIR /app/frontend
COPY frontend/ /app/frontend/
RUN npm install && npm run build

# Expose ports and set start script
EXPOSE 3000 8000
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port 8000 & cd frontend && npm start"]