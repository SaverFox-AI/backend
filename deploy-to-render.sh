#!/bin/bash

echo "==================================="
echo "SaverFox Render Deployment Helper"
echo "==================================="
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Warning: You have uncommitted changes"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Preparing deployment files..."

# Make scripts executable
chmod +x backend/apps/ai-python/render-build.sh
chmod +x backend/apps/api-ts/render-build.sh
chmod +x backend/apps/api-ts/start.sh

echo "✅ Scripts are now executable"
echo ""

echo "📝 Next steps:"
echo ""
echo "1. Commit and push your changes:"
echo "   git add ."
echo "   git commit -m 'Add Render deployment config'"
echo "   git push origin main"
echo ""
echo "2. Follow instructions in RENDER_DEPLOY.txt"
echo ""
echo "3. Create services in this order:"
echo "   a) PostgreSQL Database"
echo "   b) AI Python Service"
echo "   c) API TypeScript Service"
echo ""
echo "4. Don't forget to set environment variables!"
echo ""
echo "📚 Full guide: cat RENDER_DEPLOY.txt"
