#!/bin/bash
set -e

echo "Running database migrations..."
npm run migration:run || echo "Migration failed or already applied"

echo "Starting application..."
npm run start:prod
