#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment..."

# Ensure we are in the correct directory (the directory where the script is located)
cd "$(dirname "$0")"

# Pull the latest code
echo "📦 Pulling latest code from git..."
git pull origin main

# Build and start the containers
echo "🐳 Building and starting Docker containers..."
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Give the database a few seconds to ensure it is fully ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🔄 Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T api alembic upgrade head

# Clean up old images to save space
echo "🧹 Cleaning up unused Docker images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
