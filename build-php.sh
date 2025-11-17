#!/bin/bash
# Build script for PHP version

echo "Building PHP version for cPanel deployment..."

# Build frontend
echo "1. Building frontend..."
npm run build

# Create clean deployment folder
echo "2. Creating deployment folder..."
rm -rf deploy
mkdir -p deploy

# Copy PHP backend files
echo "3. Copying PHP backend..."
cp -r php/api deploy/
cp -r php/auth deploy/
cp -r php/includes deploy/
cp -r php/database deploy/
cp php/.htaccess deploy/
cp php/index.php deploy/
cp php/.env.example.php deploy/
cp php/README-PHP.md deploy/

# Copy frontend files (flatten dist folder)
echo "4. Copying frontend files (flattening dist/)..."
cp -r dist/* deploy/

# Create deployment package
echo "5. Creating deployment package..."
cd deploy
zip -r ../tracker-php-deploy.zip \
    * \
    .htaccess \
    .env.example.php \
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
