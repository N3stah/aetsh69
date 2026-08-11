# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libpq-dev gcc curl && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ .

# Expose port (Render sets the PORT env var)
ENV PORT=8000
EXPOSE $PORT

# Run Alembic migrations and start Uvicorn
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
