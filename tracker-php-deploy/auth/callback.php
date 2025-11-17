<?php
// Google OAuth callback handler

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/auth.php';

// Check for authorization code
if (!isset($_GET['code'])) {
    header('Location: ' . BASE_URL . '/dist/login.html?error=no_code');
    exit;
}

$code = $_GET['code'];

// Exchange code for access token
$tokenUrl = 'https://oauth2.googleapis.com/token';
$tokenData = [
    'code' => $code,
    'client_id' => GOOGLE_CLIENT_ID,
    'client_secret' => GOOGLE_CLIENT_SECRET,
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'grant_type' => 'authorization_code'
];

$ch = curl_init($tokenUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tokenData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    error_log("Token exchange failed: " . $response);
    header('Location: ' . BASE_URL . '/dist/login.html?error=token_failed');
    exit;
}

$tokenResult = json_decode($response, true);
$accessToken = $tokenResult['access_token'] ?? null;

if (!$accessToken) {
    header('Location: ' . BASE_URL . '/dist/login.html?error=no_token');
    exit;
}

// Get user info from Google
$userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
$ch = curl_init($userInfoUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);

$userInfoResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    error_log("User info fetch failed: " . $userInfoResponse);
    header('Location: ' . BASE_URL . '/dist/login.html?error=userinfo_failed');
    exit;
}

$userInfo = json_decode($userInfoResponse, true);

if (!isset($userInfo['id']) || !isset($userInfo['email'])) {
    header('Location: ' . BASE_URL . '/dist/login.html?error=invalid_user');
    exit;
}

try {
    $db = Database::getInstance();

    // Check if user exists
    $user = $db->getUserByGoogleId($userInfo['id']);

    if (!$user) {
        // Create new user
        $user = $db->createUser(
            $userInfo['id'],
            $userInfo['email'],
            $userInfo['name'] ?? '',
            $userInfo['picture'] ?? ''
        );
    }

    // Log user in
    loginUser($user);

    // Redirect to app
    header('Location: ' . BASE_URL . '/dist/calendar.html');
    exit;

} catch (Exception $e) {
    error_log("Database error during OAuth: " . $e->getMessage());
    header('Location: ' . BASE_URL . '/dist/login.html?error=db_error');
    exit;
}
