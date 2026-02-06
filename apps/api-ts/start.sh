#!/bin/bash
set -e

echo "Starting application..."
echo "Migrations will run automatically via TypeORM"
npm run start:prod
