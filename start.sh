#!/bin/bash

# check if docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "🐳 Starting database containers..."
docker compose up -d

echo "⏳ Waiting for database to be ready..."
# simple wait loop for postgres
until docker exec wine-orders-db pg_isready -U wine_user -d wine_orders >/dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo " ✅ DB is ready!"

# Kill any existing node/vite processes on the target ports to avoid zombie instances
echo "🧹 Cleaning up any old processes on ports 3000 and 5173..."
kill $(lsof -ti:3000,5173) 2>/dev/null || true

echo "🌱 Seeding database..."
npm run seed

echo "🚀 Starting development servers (API + Web)..."
npm run dev
