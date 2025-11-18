<?php
// Settings API endpoint

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/auth.php';

requireAuth();

$db = Database::getInstance();
$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $settings = $db->getSettings($userId);
            jsonResponse($settings);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                jsonError('Invalid JSON', 400);
            }

            $settings = $db->updateSettings($userId, $input);
            jsonResponse($settings);
            break;

        default:
            jsonError('Method not allowed', 405);
    }

} catch (Exception $e) {
    error_log("Settings API error: " . $e->getMessage());
    jsonError('Failed to process request', 500);
}
