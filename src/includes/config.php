<?php
// Configuration file for PHP version

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Load environment variables from .env file if it exists
// Try multiple locations
$envPaths = [
    __DIR__ . '/../.env.php',              // Docker: mounted to /var/www/html/.env.php
    __DIR__ . '/../../.env.php',           // Production: root of app folder
    $_SERVER['DOCUMENT_ROOT'] . '/.env.php',          // Absolute: server root
    $_SERVER['DOCUMENT_ROOT'] . '/trckr/.env.php',    // Absolute: subfolder (production)
    $_SERVER['DOCUMENT_ROOT'] . '/tracker/.env.php',  // Absolute: subfolder (legacy)
];

foreach ($envPaths as $envPath) {
    if (file_exists($envPath)) {
        require_once $envPath;
        break;
    }
}

// Database configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'tracker');
define('DB_USER', getenv('DB_USER') ?: 'tracker_user');
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: '');

// Google OAuth configuration
define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: '');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '');
define('GOOGLE_REDIRECT_URI', getenv('GOOGLE_REDIRECT_URI') ?: 'https://www.crbntyp.com/trckr/auth/google/callback');

// App configuration
define('BASE_URL', getenv('BASE_URL') !== false ? getenv('BASE_URL') : '/trckr');
define('APP_ENV', getenv('APP_ENV') ?: 'production');

// Session configuration - MUST be set before session_start()
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
if (APP_ENV === 'production') {
    ini_set('session.cookie_secure', 1); // HTTPS only
}

// Start session after configuring settings
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// CORS headers for AJAX requests
header('Access-Control-Allow-Origin: ' . (getenv('CLIENT_URL') ?: 'https://www.crbntyp.com'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
