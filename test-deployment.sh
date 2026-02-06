#!/bin/bash

echo "==================================="
echo "SaverFox Deployment Test"
echo "==================================="
echo ""

# Check if URLs are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./test-deployment.sh <AI_SERVICE_URL> <API_SERVICE_URL>"
    echo ""
    echo "Example:"
    echo "  ./test-deployment.sh https://saverfox-ai-python.onrender.com https://saverfox-api-ts.onrender.com"
    exit 1
fi

AI_URL=$1
API_URL=$2

echo "Testing AI Service: $AI_URL"
echo "Testing API Service: $API_URL"
echo ""

# Test AI Service Health
echo "1. Testing AI Service Health..."
AI_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$AI_URL/health")
if [ "$AI_HEALTH" = "200" ]; then
    echo "   ✅ AI Service is healthy"
else
    echo "   ❌ AI Service health check failed (HTTP $AI_HEALTH)"
fi

# Test API Service Health
echo "2. Testing API Service Health..."
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health")
if [ "$API_HEALTH" = "200" ]; then
    echo "   ✅ API Service is healthy"
else
    echo "   ❌ API Service health check failed (HTTP $API_HEALTH)"
fi

# Test API Docs
echo "3. Testing API Documentation..."
API_DOCS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/docs")
if [ "$API_DOCS" = "200" ]; then
    echo "   ✅ API Docs are accessible"
    echo "   📚 View at: $API_URL/api/docs"
else
    echo "   ❌ API Docs not accessible (HTTP $API_DOCS)"
fi

echo ""
echo "==================================="
echo "Test Summary"
echo "==================================="
echo ""

if [ "$AI_HEALTH" = "200" ] && [ "$API_HEALTH" = "200" ]; then
    echo "✅ All services are running!"
    echo ""
    echo "Next steps:"
    echo "1. Test registration: POST $API_URL/api/auth/register"
    echo "2. Test login: POST $API_URL/api/auth/login"
    echo "3. View API docs: $API_URL/api/docs"
else
    echo "❌ Some services are not responding"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check Render dashboard for logs"
    echo "2. Verify environment variables"
    echo "3. Check if services are still deploying"
    echo "4. Wait 30-60s if services were sleeping"
fi
