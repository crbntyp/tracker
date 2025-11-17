<?php
// Local development environment configuration template
// Copy this to .env.php and update with your actual credentials

// Database configuration
putenv('DB_HOST=your-database-host');  // e.g., localhost or remote IP
putenv('DB_NAME=your_database_name');
putenv('DB_USER=your_database_user');
putenv('DB_PASSWORD=your_database_password');

// Google OAuth configuration
// Get these from: https://console.cloud.google.com/
putenv('GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com');
putenv('GOOGLE_CLIENT_SECRET=your-client-secret');
putenv('GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback.php');

// App configuration
putenv('BASE_URL=');  // Empty for root path, '/tracker' for subfolder
putenv('CLIENT_URL=http://localhost:8000');
putenv('APP_ENV=development');
?>
