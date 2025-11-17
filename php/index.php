<?php
// Main entry point for PHP version

require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/Database.php';
require_once __DIR__ . '/includes/auth.php';

// Simple router based on REQUEST_URI
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = BASE_URL;

// Remove base path from request URI
$path = str_replace($basePath, '', $requestUri);
$path = strtok($path, '?'); // Remove query string
$path = rtrim($path, '/'); // Remove trailing slash

// Root path - redirect based on auth status
if ($path === '' || $path === '/') {
    if (isAuthenticated()) {
        header('Location: ' . $basePath . '/dist/calendar.html');
    } else {
        header('Location: ' . $basePath . '/dist/login.html');
    }
    exit;
}

// Handle login page
if ($path === '/login.html' || $path === '/dist/login.html') {
    readfile(__DIR__ . '/dist/login.html');
    exit;
}

// All other static files are served by Apache directly
// This file is just for routing authenticated pages
http_response_code(404);
echo '404 Not Found';
