#!/bin/bash
# Build script - compiles SCSS and copies files to root

echo "Building frontend..."

# Compile SCSS
echo "→ Compiling SCSS..."
sass src/scss/styles.scss css/styles.css

# Copy HTML files
echo "→ Copying HTML..."
cp src/*.html .

# Copy JS files
echo "→ Copying JS..."
mkdir -p js
cp src/js/*.js js/

echo ""
echo "✓ Build complete!"
echo ""
echo "Files are ready to upload to cPanel."
echo "Upload everything EXCEPT: src/, node_modules/, .git/"
echo ""
