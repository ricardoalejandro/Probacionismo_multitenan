#!/bin/sh
set -e

echo "� Backend starting..."
echo "   NODE_ENV: ${NODE_ENV}"
echo "   DOMAIN: ${DOMAIN:-not set}"

echo "🔄 Waiting for PostgreSQL to be ready..."
timeout=30
counter=0
while ! nc -z postgres 5432; do
  counter=$((counter + 1))
  if [ $counter -ge $timeout ]; then
    echo "❌ Timeout waiting for PostgreSQL"
    exit 1
  fi
  sleep 1
done

echo "✅ PostgreSQL is ready!"

echo "🔄 Running database migrations..."
npm run db:generate 2>/dev/null || echo "⚠️  Generate skipped (already up to date)"
npm run db:migrate || echo "⚠️  Migrations may have already been applied"

echo "🌱 Running database seed (creates/updates admin from environment)..."
npm run db:seed

echo "🚀 Starting backend server..."
exec node dist/index.js
