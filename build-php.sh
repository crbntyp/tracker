#!/bin/bash
# Build script for PHP version

echo "Building PHP version for cPanel deployment..."

# Build frontend
echo "1. Building frontend..."
npm run build

# Copy dist to php folder
echo "2. Copying dist folder to php..."
rm -rf php/dist
cp -r dist php/dist

# Create deployment package
echo "3. Creating deployment package..."
cd php
zip -r ../tracker-php-deploy.zip \
    .htaccess \
    index.php \
    api/ \
    auth/ \
    includes/ \
    database/ \
    dist/ \
    .env.example.php \
    README-PHP.md \
    -x "*.DS_Store" "*__MACOSX*"

cd ..

echo ""
echo "✓ Build complete!"
echo ""
echo "Deployment package created: tracker-php-deploy.zip"
echo ""
echo "Upload contents to your cPanel /public_html/tracker/ directory"
echo "Don't forget to:"
echo "  1. Create MySQL database in cPanel"
echo "  2. Copy .env.example.php to .env.php and configure"
echo "  3. Run database/init-db.php to create tables"
echo "  4. Update Google OAuth redirect URI"
echo ""
