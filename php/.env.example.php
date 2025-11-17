<?php
// Environment configuration file
// Copy this to .env.php and fill in your values
// DO NOT commit .env.php to version control!

// Database configuration
putenv('DB_HOST=localhost');
putenv('DB_NAME=tracker');
putenv('DB_USER=your_db_username');
putenv('DB_PASSWORD=your_db_password');

// Google OAuth configuration
putenv('GOOGLE_CLIENT_ID=your_google_client_id');
putenv('GOOGLE_CLIENT_SECRET=your_google_client_secret');
putenv('GOOGLE_REDIRECT_URI=https://carbontype.co/tracker/auth/callback.php');

// App configuration
putenv('BASE_URL=/tracker');
putenv('CLIENT_URL=https://carbontype.co');
putenv('APP_ENV=production');
