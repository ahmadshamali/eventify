FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for mysql client
RUN apt-get update \
    && apt-get install -y default-libmysqlclient-dev pkg-config gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# The rest of the code is injected via volumes in docker-compose.yml for live reload (dev).
# In production, the COPY above ensures the code is baked into the image.
