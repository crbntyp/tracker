<?php
// Entries API endpoint

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
            // Get all entries or single entry by date
            if (isset($_GET['date'])) {
                $date = $_GET['date'];
                $entry = $db->getEntryByDate($userId, $date);

                // Parse JSON fields
                if ($entry) {
                    $entry['lunch'] = json_decode($entry['lunch'] ?? '{"logged":false}', true);
                    $entry['dinner'] = json_decode($entry['dinner'] ?? '{"logged":false}', true);
                    $entry['drinks'] = json_decode($entry['drinks'] ?? '[]', true);
                }

                jsonResponse($entry);
            } else {
                $entries = $db->getEntries($userId);

                // Parse JSON fields for all entries
                foreach ($entries as &$entry) {
                    $entry['lunch'] = json_decode($entry['lunch'] ?? '{"logged":false}', true);
                    $entry['dinner'] = json_decode($entry['dinner'] ?? '{"logged":false}', true);
                    $entry['drinks'] = json_decode($entry['drinks'] ?? '[]', true);
                }

                jsonResponse($entries);
            }
            break;

        case 'POST':
            // Create or update entry
            $input = json_decode(file_get_contents('php://input'), true);

            if (!isset($input['date'])) {
                jsonError('Date is required', 400);
            }

            $date = $input['date'];
            $weight = $input['weight'] ?? null;
            $lunch = isset($input['lunch']) ? json_encode($input['lunch']) : null;
            $dinner = isset($input['dinner']) ? json_encode($input['dinner']) : null;
            $drinks = isset($input['drinks']) ? json_encode($input['drinks']) : null;
            $notes = $input['notes'] ?? null;

            $entry = $db->saveEntry($userId, $date, $weight, $lunch, $dinner, $drinks, $notes);

            // Parse JSON fields
            if ($entry) {
                $entry['lunch'] = json_decode($entry['lunch'] ?? '{"logged":false}', true);
                $entry['dinner'] = json_decode($entry['dinner'] ?? '{"logged":false}', true);
                $entry['drinks'] = json_decode($entry['drinks'] ?? '[]', true);
            }

            jsonResponse($entry);
            break;

        case 'DELETE':
            // Delete entry by date
            if (!isset($_GET['date'])) {
                jsonError('Date is required', 400);
            }

            $date = $_GET['date'];
            $db->deleteEntry($userId, $date);
            jsonResponse(['success' => true]);
            break;

        default:
            jsonError('Method not allowed', 405);
    }

} catch (Exception $e) {
    error_log("Entries API error: " . $e->getMessage());
    jsonError('Failed to process request', 500);
}
