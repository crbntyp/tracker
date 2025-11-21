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
                    $entry['weight'] = $entry['weight'] ? json_decode($entry['weight'], true) : null;
                    $entry['lunch'] = json_decode($entry['lunch'] ?? '{"logged":false}', true);
                    $entry['dinner'] = json_decode($entry['dinner'] ?? '{"logged":false}', true);
                    $entry['drinks'] = json_decode($entry['drinks'] ?? '[]', true);
                    $entry['meals'] = $entry['meals'] ? json_decode($entry['meals'], true) : null;
                    $entry['gym'] = (bool)($entry['gym'] ?? false);
                    $entry['steps'] = $entry['steps'] ? (int)$entry['steps'] : null;
                }

                jsonResponse($entry);
            } else {
                $entries = $db->getEntries($userId);

                // Parse JSON fields for all entries
                foreach ($entries as &$entry) {
                    $entry['weight'] = $entry['weight'] ? json_decode($entry['weight'], true) : null;
                    $entry['lunch'] = json_decode($entry['lunch'] ?? '{"logged":false}', true);
                    $entry['dinner'] = json_decode($entry['dinner'] ?? '{"logged":false}', true);
                    $entry['drinks'] = json_decode($entry['drinks'] ?? '[]', true);
                    $entry['meals'] = $entry['meals'] ? json_decode($entry['meals'], true) : null;
                    $entry['gym'] = (bool)($entry['gym'] ?? false);
                    $entry['steps'] = $entry['steps'] ? (int)$entry['steps'] : null;
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
            $weight = isset($input['weight']) ? json_encode($input['weight']) : null;
            $lunch = isset($input['lunch']) ? json_encode($input['lunch']) : null;
            $dinner = isset($input['dinner']) ? json_encode($input['dinner']) : null;
            $drinks = isset($input['drinks']) ? json_encode($input['drinks']) : null;
            $meals = isset($input['meals']) ? json_encode($input['meals']) : null;
            $notes = $input['notes'] ?? null;
            $diary = $input['diary'] ?? null;
            $gym = isset($input['gym']) ? (bool)$input['gym'] : null;
            $supplements = $input['supplements'] ?? null;
            $steps = isset($input['steps']) ? (int)$input['steps'] : null;

            $entry = $db->saveEntry($userId, $date, $weight, $lunch, $dinner, $drinks, $notes, $diary, $gym, $supplements, $steps, $meals);

            // Parse JSON fields
            if ($entry) {
                $entry['weight'] = $entry['weight'] ? json_decode($entry['weight'], true) : null;
                $entry['lunch'] = json_decode($entry['lunch'] ?? '{"logged":false}', true);
                $entry['dinner'] = json_decode($entry['dinner'] ?? '{"logged":false}', true);
                $entry['drinks'] = json_decode($entry['drinks'] ?? '[]', true);
                $entry['meals'] = $entry['meals'] ? json_decode($entry['meals'], true) : null;
                $entry['gym'] = (bool)($entry['gym'] ?? false);
                $entry['steps'] = $entry['steps'] ? (int)$entry['steps'] : null;
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
