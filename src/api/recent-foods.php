<?php
// Recent Foods API endpoint

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
            // Get recent foods for user
            $recentFoods = $db->getRecentFoods($userId);
            jsonResponse($recentFoods);
            break;

        case 'POST':
            // Add a recent food item
            $input = json_decode(file_get_contents('php://input'), true);

            if (!isset($input['name']) || !isset($input['barcode'])) {
                jsonError('Name and barcode are required', 400);
            }

            $id = $db->addRecentFood(
                $userId,
                $input['name'],
                $input['brand'] ?? '',
                $input['barcode'],
                $input['image'] ?? '',
                $input['calories'] ?? 0,
                $input['protein'] ?? 0,
                $input['carbs'] ?? 0,
                $input['fat'] ?? 0,
                $input['sugar'] ?? 0
            );

            jsonResponse(['id' => $id, 'success' => true]);
            break;

        default:
            jsonError('Method not allowed', 405);
    }

} catch (Exception $e) {
    error_log("Recent Foods API error: " . $e->getMessage());
    jsonError('Failed to process request', 500);
}
