#!/bin/bash
# Switch to PRODUCTION configuration

echo "🚀 Switching to PRODUCTION configuration..."

# Copy production .htaccess
if [ -f ".htaccess.production" ]; then
    cp .htaccess.production .htaccess
    echo "✓ .htaccess set to PRODUCTION (RewriteBase /tracker/)"
else
    echo "❌ .htaccess.production not found!"
    exit 1
fi

# Show git status
echo ""
echo "📋 Files ready to commit/upload:"
git status --short

echo ""
echo "✅ PRODUCTION configuration restored!"
echo ""
echo "📤 Upload these files to cPanel:"
echo "   - api/entries.php"
echo "   - js/*.js"
echo "   - *.html"
echo "   - database/migrate-weight-to-json.sql (run in phpMyAdmin)"
echo ""
echo "⚠️  DO NOT upload .env.php (keep production version on server)"
