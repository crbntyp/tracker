<?php
// Database initialization script for cPanel

require_once __DIR__ . '/../includes/config.php';

echo "Initializing MySQL database...\n\n";

try {
    // Connect to MySQL
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";charset=utf8mb4",
        DB_USER,
        DB_PASSWORD,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    echo "Connected to MySQL server.\n";

    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database '" . DB_NAME . "' created or already exists.\n";

    // Select database
    $pdo->exec("USE " . DB_NAME);
    echo "Using database '" . DB_NAME . "'.\n\n";

    // Read and execute schema
    $schema = file_get_contents(__DIR__ . '/schema.sql');
    $statements = array_filter(array_map('trim', explode(';', $schema)));

    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $pdo->exec($statement);
        }
    }

    echo "Database schema created successfully!\n\n";
    echo "Tables created:\n";
    echo "  - users\n";
    echo "  - entries\n\n";

    echo "Database initialization complete.\n";

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
