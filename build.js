#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Recursively copy directory
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    log(`⚠ Source directory not found: ${src}`, 'yellow');
    return;
  }

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      // Set readable permissions for Docker (644 for files)
      fs.chmodSync(destPath, 0o644);
    }
  }
}

// Copy a single file
function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    log(`⚠ Source file not found: ${src}`, 'yellow');
    return;
  }

  const destDir = path.dirname(dest);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);

  // Set readable permissions for Docker (644 for files)
  fs.chmodSync(dest, 0o644);
}

// Clean dist directory
function clean() {
  log('🧹 Cleaning dist directory...', 'blue');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  log('✓ Cleaned dist directory', 'green');
}

// Compile SCSS to CSS
function compileScss() {
  log('🎨 Compiling SCSS...', 'blue');
  try {
    const scssInput = path.join(SRC_DIR, 'scss', 'styles.scss');
    const cssOutput = path.join(DIST_DIR, 'css', 'styles.css');

    fs.mkdirSync(path.join(DIST_DIR, 'css'), { recursive: true });

    execSync(`sass ${scssInput}:${cssOutput} --no-source-map`, {
      stdio: 'inherit'
    });

    log('✓ SCSS compiled successfully', 'green');
  } catch (error) {
    log('✗ SCSS compilation failed', 'red');
    throw error;
  }
}

// Copy PHP files
function copyPhp() {
  log('📄 Copying PHP files...', 'blue');

  // Copy directories
  copyDir(path.join(SRC_DIR, 'api'), path.join(DIST_DIR, 'api'));
  copyDir(path.join(SRC_DIR, 'auth'), path.join(DIST_DIR, 'auth'));
  copyDir(path.join(SRC_DIR, 'includes'), path.join(DIST_DIR, 'includes'));

  // Copy index.php
  copyFile(path.join(SRC_DIR, 'index.php'), path.join(DIST_DIR, 'index.php'));

  log('✓ PHP files copied', 'green');
}

// Copy JavaScript files
function copyJs() {
  log('📜 Copying JavaScript files...', 'blue');
  copyDir(path.join(SRC_DIR, 'js'), path.join(DIST_DIR, 'js'));
  log('✓ JavaScript files copied', 'green');
}

// Copy HTML files
function copyHtml() {
  log('📝 Copying HTML files...', 'blue');

  const htmlDir = path.join(SRC_DIR, 'html');
  if (!fs.existsSync(htmlDir)) {
    log('⚠ HTML directory not found', 'yellow');
    return;
  }

  const htmlFiles = fs.readdirSync(htmlDir).filter(file => file.endsWith('.html'));

  htmlFiles.forEach(file => {
    copyFile(
      path.join(htmlDir, file),
      path.join(DIST_DIR, file)
    );
  });

  log('✓ HTML files copied', 'green');
}

// Copy static assets
function copyStatic() {
  log('🖼️  Copying static assets...', 'blue');

  const staticDir = path.join(SRC_DIR, 'static');
  if (!fs.existsSync(staticDir)) {
    log('⚠ Static directory not found', 'yellow');
    return;
  }

  const staticEntries = fs.readdirSync(staticDir, { withFileTypes: true });

  staticEntries.forEach(entry => {
    // Skip .htaccess template files - we'll handle them separately
    if (entry.name.startsWith('.htaccess.')) {
      return;
    }

    const srcPath = path.join(staticDir, entry.name);
    const destPath = path.join(DIST_DIR, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });

  // Copy production .htaccess as the actual .htaccess file
  const htaccessProd = path.join(staticDir, '.htaccess.production');
  if (fs.existsSync(htaccessProd)) {
    copyFile(htaccessProd, path.join(DIST_DIR, '.htaccess'));
    log('✓ Production .htaccess copied', 'green');
  }

  log('✓ Static assets copied', 'green');
}

// Main build function
function build() {
  log('\n🚀 Starting build process...\n', 'blue');

  try {
    clean();
    copyPhp();
    copyJs();
    copyHtml();
    copyStatic();
    compileScss();

    log('\n✅ Build completed successfully!\n', 'green');
  } catch (error) {
    log('\n❌ Build failed!\n', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run build
build();
