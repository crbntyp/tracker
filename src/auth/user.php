<?php
// Get current user endpoint

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/auth.php';

if (!isAuthenticated()) {
    jsonError('Not authenticated', 401);
}

$user = getCurrentUser();

if (!$user) {
    jsonError('User not found', 404);
}

// Return user data (exclude sensitive fields)
jsonResponse([
    'id' => $user['id'],
    'email' => $user['email'],
    'name' => $user['name'],
    'picture' => $user['picture']
]);
