FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed by torch and sentence-transformers
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first — Docker caches this layer
# and only re-runs pip install when requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]