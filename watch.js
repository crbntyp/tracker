#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chokidar = require('chokidar');
const browserSync = require('browser-sync').create();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

// Debounced Docker restart to prevent 403 errors
let restartTimeout;
function restartDockerWeb() {
  clearTimeout(restartTimeout);
  restartTimeout = setTimeout(() => {
    try {
      log('🔄 Restarting Docker web container...', 'blue');
      execSync('docker-compose restart web', { stdio: 'ignore' });
      log('✓ Docker web container restarted', 'green');
    } catch (error) {
      log('Failed to restart Docker (this is optional)', 'yellow');
    }
  }, 1000); // Wait 1 second after last change
}

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');

log(`SRC_DIR: ${SRC_DIR}`, 'cyan');
log(`DIST_DIR: ${DIST_DIR}`, 'cyan');

// Copy file helper
function copyFile(src, dest) {
  try {
    const destDir = path.dirname(dest);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
    // Set readable permissions for Docker (644 for files)
    fs.chmodSync(dest, 0o644);
    return true;
  } catch (error) {
    log(`Error copying ${src}: ${error.message}`, 'red');
    return false;
  }
}

// Copy directory helper
function copyDir(src, dest) {
  try {
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
    return true;
  } catch (error) {
    log(`Error copying directory ${src}: ${error.message}`, 'red');
    return false;
  }
}

// Handle file changes
function handleChange(filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);

  // Determine destination path
  let destPath;

  if (filePath.includes('/html/')) {
    // HTML files go to dist root
    const fileName = path.basename(filePath);
    destPath = path.join(DIST_DIR, fileName);
  } else if (filePath.includes('/static/')) {
    // Static files go to dist root
    const fileName = path.basename(filePath);
    destPath = path.join(DIST_DIR, fileName);
  } else if (filePath.includes('/scss/')) {
    // SCSS files trigger recompilation (handled separately)
    return;
  } else {
    // Other files maintain their structure (api, auth, includes, js)
    destPath = path.join(DIST_DIR, relativePath);
  }

  if (copyFile(filePath, destPath)) {
    log(`✓ Copied: ${relativePath}`, 'green');
    // Reload browser
    browserSync.reload();
  }
}

// Handle file deletion
function handleUnlink(filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);
  let destPath;

  if (filePath.includes('/html/')) {
    const fileName = path.basename(filePath);
    destPath = path.join(DIST_DIR, fileName);
  } else if (filePath.includes('/static/')) {
    const fileName = path.basename(filePath);
    destPath = path.join(DIST_DIR, fileName);
  } else {
    destPath = path.join(DIST_DIR, relativePath);
  }

  try {
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
      log(`✓ Deleted: ${relativePath}`, 'yellow');
      // Reload browser
      browserSync.reload();
    }
  } catch (error) {
    log(`Error deleting ${destPath}: ${error.message}`, 'red');
  }
}

// Initial build
log('🚀 Running initial build...', 'blue');
try {
  execSync('node build.js', { stdio: 'inherit' });
  // Restart Docker after initial build to ensure fresh permissions
  restartDockerWeb();
} catch (error) {
  log('Initial build failed', 'red');
  process.exit(1);
}

// Initialize browser-sync with snippet mode (inject reload script)
log('\n🌐 Starting browser sync...', 'blue');
browserSync.init({
  proxy: 'localhost:8000',
  port: 3000,
  open: false,
  notify: true,  // Show reload notifications
  logLevel: 'info',  // Show what's reloading
  files: [
    'dist/**/*.css',
    'dist/**/*.js',
    'dist/**/*.html',
    'dist/**/*.php'
  ]
});

log('✓ Browser sync ready', 'green');
log('  - Use http://localhost:8000 for OAuth login & development', 'cyan');
log('  - Browser auto-reloads on file changes', 'cyan');
log('\n👀 Watching for changes...\n', 'cyan');

// Watch the entire src directory (simpler and more reliable)
log(`Watching directory: ${SRC_DIR}`, 'cyan');

const fileWatcher = chokidar.watch(SRC_DIR, {
  ignored: [
    /(^|[\/\\])\../,  // ignore dotfiles
    '**/node_modules/**',  // ignore node_modules
    '**/*.scss'  // SCSS handled separately
  ],
  persistent: true,
  ignoreInitial: true,
  usePolling: true, // Force polling on macOS for reliability
  interval: 300      // Poll every 300ms
});

fileWatcher
  .on('add', (path) => {
    log(`[WATCHER] File added: ${path}`, 'cyan');
    handleChange(path);
  })
  .on('change', (path) => {
    log(`[WATCHER] File changed: ${path}`, 'cyan');
    handleChange(path);
  })
  .on('unlink', (path) => {
    log(`[WATCHER] File deleted: ${path}`, 'cyan');
    handleUnlink(path);
  })
  .on('ready', () => {
    log('[WATCHER] Ready and watching files', 'green');
  });

// Use Sass built-in watch for better partial file detection
log('🎨 Starting Sass watcher...', 'blue');
const sassProcess = require('child_process').spawn(
  'sass',
  ['--watch', 'src/scss/styles.scss:dist/css/styles.css', '--no-source-map'],
  { stdio: ['ignore', 'pipe', 'pipe'] }
);

// Log sass compilation events
sassProcess.stdout.on('data', (data) => {
  const output = data.toString().trim();
  if (output.includes('Compiled')) {
    log('✓ SCSS compiled', 'green');
    // Restart Docker web container to prevent 403 errors
    restartDockerWeb();
  }
});

sassProcess.stderr.on('data', (data) => {
  const error = data.toString().trim();
  // Ignore deprecation warnings
  if (!error.includes('DEPRECATION') && !error.includes('WARNING')) {
    log(`SCSS error: ${error}`, 'red');
  }
});

log('✓ Sass watcher started', 'green');

// Keep process alive and handle cleanup
process.on('SIGINT', () => {
  log('\n👋 Stopping watch mode...', 'yellow');

  // Kill sass watcher
  if (sassProcess) {
    sassProcess.kill();
  }

  // Stop browser-sync
  browserSync.exit();

  process.exit(0);
});
