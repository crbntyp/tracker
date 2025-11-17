<?php
// Authentication helper functions

function isAuthenticated() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function requireAuth() {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }
}

function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }

    $db = Database::getInstance();
    return $db->getUserById($_SESSION['user_id']);
}

function loginUser($user) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['google_id'] = $user['google_id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['name'] = $user['name'];
    $_SESSION['picture'] = $user['picture'];
}

function logoutUser() {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function jsonError($message, $statusCode = 500) {
    jsonResponse(['error' => $message], $statusCode);
}
