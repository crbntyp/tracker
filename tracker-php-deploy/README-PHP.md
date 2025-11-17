# Weight Tracker - PHP Version for cPanel

This is the PHP version of the weight tracker app, designed to run on cPanel hosting with MySQL.

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache with mod_rewrite enabled
- cURL extension enabled
- JSON extension enabled

## Installation on cPanel

### 1. Build the Frontend (on your local machine)

```bash
npm run build
```

This creates the `dist/` folder with compiled CSS, JS, and HTML files.

### 2. Upload Files to cPanel

Upload these files/folders to `/public_html/tracker/`:

```
/public_html/tracker/
├── .htaccess
├── index.php
├── api/
│   ├── entries.php
│   └── settings.php
├── auth/
│   ├── google.php
│   ├── callback.php
│   ├── logout.php
│   └── user.php
├── includes/
│   ├── config.php
│   ├── Database.php
│   └── auth.php
├── database/
│   ├── schema.sql
│   └── init-db.php
└── dist/
    ├── calendar.html
    ├── charts.html
    ├── login.html
    ├── css/
    ├── js/
    └── logo.png
```

### 3. Create MySQL Database in cPanel

1. Log into cPanel
2. Go to **MySQL Databases**
3. Create a new database (e.g., `username_tracker`)
4. Create a new MySQL user
5. Add the user to the database with ALL PRIVILEGES
6. Note down the database name, username, and password

### 4. Configure Environment Variables

Copy `.env.example.php` to `.env.php`:

```bash
cp .env.example.php .env.php
```

Edit `.env.php` with your actual values:

```php
<?php
putenv('DB_HOST=localhost');
putenv('DB_NAME=username_tracker');
putenv('DB_USER=username_dbuser');
putenv('DB_PASSWORD=your_secure_password');

putenv('GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com');
putenv('GOOGLE_CLIENT_SECRET=your_google_client_secret');
putenv('GOOGLE_REDIRECT_URI=https://carbontype.co/tracker/auth/callback.php');

putenv('BASE_URL=/tracker');
putenv('CLIENT_URL=https://carbontype.co');
putenv('APP_ENV=production');
?>
```

### 5. Initialize Database

Run the initialization script once:

**Option A: Via browser**
Navigate to: `https://carbontype.co/tracker/database/init-db.php`

**Option B: Via SSH (if available)**
```bash
cd /home/username/public_html/tracker
php database/init-db.php
```

**Option C: Via phpMyAdmin**
1. Open phpMyAdmin in cPanel
2. Select your database
3. Go to "Import" tab
4. Upload `database/schema.sql`
5. Click "Go"

### 6. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add to **Authorized redirect URIs**:
   ```
   https://carbontype.co/tracker/auth/callback.php
   ```

### 7. Set File Permissions

Make sure files have correct permissions:

```bash
chmod 755 /public_html/tracker
chmod 644 /public_html/tracker/.htaccess
chmod 644 /public_html/tracker/.env.php
chmod 644 /public_html/tracker/index.php
find /public_html/tracker -type d -exec chmod 755 {} \;
find /public_html/tracker -type f -exec chmod 644 {} \;
```

### 8. Test Your Installation

1. Visit `https://carbontype.co/tracker`
2. You should be redirected to the login page
3. Click "Login with Google"
4. Complete OAuth flow
5. You should be redirected to the calendar page

## Troubleshooting

### White screen or 500 error
- Check PHP error logs in cPanel
- Verify .env.php has correct database credentials
- Make sure mod_rewrite is enabled

### OAuth redirect not working
- Verify GOOGLE_REDIRECT_URI matches exactly in both `.env.php` and Google Console
- Make sure URL uses HTTPS
- Check that callback.php is accessible

### Database connection errors
- Verify database credentials in `.env.php`
- Check that MySQL user has privileges on the database
- Test connection using phpMyAdmin

### Login works but data doesn't save
- Check that database tables were created (run init-db.php)
- Verify sessions are working (check phpinfo for session support)
- Check PHP error logs for any database errors

## API Endpoints

All endpoints require authentication (except auth endpoints):

### Auth
- `GET /auth/google` - Start OAuth login
- `GET /auth/callback.php` - OAuth callback
- `GET /auth/logout` - Logout
- `GET /auth/user` - Get current user

### Entries
- `GET /api/entries` - Get all entries
- `GET /api/entries?date=YYYY-MM-DD` - Get entry by date
- `POST /api/entries` - Create/update entry
- `DELETE /api/entries?date=YYYY-MM-DD` - Delete entry

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update user settings

## Security Notes

- Never commit `.env.php` to version control
- Use strong database passwords
- Keep Google OAuth credentials secret
- Make sure HTTPS is enabled on your domain
- Regularly update PHP and dependencies

## Differences from Node.js Version

- No real-time features (no WebSockets)
- Session-based instead of JWT
- MySQL instead of PostgreSQL
- Runs on Apache instead of Node.js/Express
- No Docker required

## Support

For issues, check:
1. PHP error logs in cPanel
2. Browser console for JavaScript errors
3. Network tab for failed API requests
