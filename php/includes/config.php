<?php
// Configuration file for PHP version

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Load environment variables from .env file if it exists
if (file_exists(__DIR__ . '/../../.env.php')) {
    require_once __DIR__ . '/../../.env.php';
}

// Database configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'tracker');
define('DB_USER', getenv('DB_USER') ?: 'tracker_user');
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: '');

// Google OAuth configuration
define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: '');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '');
define('GOOGLE_REDIRECT_URI', getenv('GOOGLE_REDIRECT_URI') ?: 'https://carbontype.co/tracker/auth/callback.php');

// App configuration
define('BASE_URL', getenv('BASE_URL') ?: '/tracker');
define('APP_ENV', getenv('APP_ENV') ?: 'production');

// Session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
if (APP_ENV === 'production') {
    ini_set('session.cookie_secure', 1); // HTTPS only
}

// CORS headers for AJAX requests
header('Access-Control-Allow-Origin: ' . (getenv('CLIENT_URL') ?: 'https://carbontype.co'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
