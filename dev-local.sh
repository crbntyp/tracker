#!/bin/bash
# Switch to LOCAL development configuration

echo "🔧 Switching to LOCAL configuration..."

# Copy local .htaccess
if [ -f ".htaccess.local" ]; then
    cp .htaccess.local .htaccess
    echo "✓ .htaccess set to LOCAL (RewriteBase /)"
else
    echo "❌ .htaccess.local not found!"
    exit 1
fi

# Check if .env.php exists
if [ ! -f ".env.php" ]; then
    if [ -f ".env.local.php" ]; then
        cp .env.local.php .env.php
        echo "✓ Created .env.php from template"
        echo "⚠️  Please edit .env.php and update:"
        echo "   - GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback"
        echo "   - BASE_URL="
    else
        echo "❌ .env.local.php not found!"
        exit 1
    fi
else
    echo "✓ .env.php already exists"
fi

echo ""
echo "🐳 Starting Docker..."
docker-compose up -d

echo ""
echo "✅ LOCAL development ready!"
echo "   Open: http://localhost:8000"
echo ""
echo "⚠️  IMPORTANT: Before deploying to production, run: ./dev-production.sh"
