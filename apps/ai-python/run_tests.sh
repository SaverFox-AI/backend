#!/bin/bash

# Run tests for SaverFox AI Service

echo "Running SaverFox AI Service Tests..."
echo "===================================="

# Set test environment variables
export OPENAI_API_KEY="test-key-123"
export OPIK_API_KEY="test-opik-key-123"

# Run pytest with coverage
poetry run pytest tests/ -v --cov=src --cov-report=term-missing

echo ""
echo "Tests completed!"
