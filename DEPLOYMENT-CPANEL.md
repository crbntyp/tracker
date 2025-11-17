# cPanel Deployment Checklist

## Before You Start

Make sure you have:
- [ ] GoDaddy cPanel login credentials
- [ ] Google Cloud Console access
- [ ] FTP client (FileZilla) or cPanel File Manager access

## Step-by-Step Deployment

### 1. Build the Package (Local Machine)

```bash
./build-php.sh
```

This creates `tracker-php-deploy.zip` with everything you need.

### 2. Create MySQL Database (cPanel)

1. Log into GoDaddy cPanel
2. Find **MySQL Databases** (under Databases section)
3. Create database:
   - Database name: `tracker` (will be prefixed, e.g., `username_tracker`)
   - Note the full name shown
4. Create user:
   - Username: `tracker_user`
   - Password: Generate strong password
   - Note credentials
5. Add user to database:
   - Select user and database
   - Grant ALL PRIVILEGES

### 3. Upload Files (cPanel File Manager or FTP)

**Option A: cPanel File Manager**
1. Go to **File Manager**
2. Navigate to `public_html`
3. Create folder `tracker`
4. Upload `tracker-php-deploy.zip`
5. Right-click → Extract
6. Delete the .zip file

**Option B: FTP (FileZilla)**
1. Connect to your FTP
2. Navigate to `/public_html/`
3. Create `tracker` folder
4. Extract `tracker-php-deploy.zip` locally
5. Upload all extracted files to `/public_html/tracker/`

### 4. Configure Environment

1. In File Manager, navigate to `/public_html/tracker/`
2. Copy `.env.example.php` → `.env.php`
3. Edit `.env.php`:

```php
<?php
putenv('DB_HOST=localhost');
putenv('DB_NAME=username_tracker');  // Your actual database name
putenv('DB_USER=username_tracker_user');  // Your actual username
putenv('DB_PASSWORD=your_actual_password');

putenv('GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com');
putenv('GOOGLE_CLIENT_SECRET=your_client_secret');
putenv('GOOGLE_REDIRECT_URI=https://carbontype.co/tracker/auth/callback.php');

putenv('BASE_URL=/tracker');
putenv('CLIENT_URL=https://carbontype.co');
putenv('APP_ENV=production');
?>
```

4. Save the file

### 5. Set File Permissions

In File Manager:
1. Select `.htaccess` → Permissions → 644
2. Select `.env.php` → Permissions → 644
3. All folders → Permissions → 755
4. All other files → Permissions → 644

### 6. Initialize Database

Visit in browser:
```
https://carbontype.co/tracker/database/init-db.php
```

You should see:
```
Database initialization complete.
Tables created:
  - users
  - entries
```

**Important:** After successful init, delete or rename `init-db.php` for security:
```
database/init-db.php → database/init-db.php.bak
```

### 7. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. **APIs & Services** → **Credentials**
4. Click your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   ```
   https://carbontype.co/tracker/auth/callback.php
   ```
6. Click **Save**

### 8. Test the Application

1. Visit `https://carbontype.co/tracker`
2. Should redirect to login page
3. Click **"Login with Google"**
4. Sign in with Google account
5. Should redirect to calendar page
6. Add a weight entry
7. Check if it saves and displays

### Troubleshooting

**500 Internal Server Error**
- Check `.htaccess` file exists and has correct permissions
- Check PHP error logs in cPanel
- Verify mod_rewrite is enabled

**Database Connection Error**
- Verify credentials in `.env.php` match cPanel database
- Check database name includes prefix (e.g., `username_tracker` not just `tracker`)
- Verify database user has ALL PRIVILEGES

**Google OAuth Error**
- Verify redirect URI matches exactly in Google Console
- Must use HTTPS
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct

**Blank Page After Login**
- Check that database was initialized (tables exist)
- Check PHP error logs
- Verify sessions are working (check phpinfo)

**Can't Save Data**
- Check database tables were created
- Verify API endpoints are accessible: `https://carbontype.co/tracker/api/entries`
- Check browser console for JavaScript errors

## Post-Deployment

After successful deployment:

- [ ] Delete `database/init-db.php` (security)
- [ ] Test login with different Google accounts
- [ ] Test creating, editing, deleting entries
- [ ] Test on mobile devices
- [ ] Set up regular database backups in cPanel
- [ ] Monitor PHP error logs for issues

## Updating the App

To deploy updates:

1. Make changes locally
2. Run `./build-php.sh`
3. Upload new files via FTP/File Manager
4. Don't overwrite `.env.php`
5. Clear browser cache and test

## Support

If you get stuck:
1. Check PHP error logs in cPanel
2. Check browser console (F12) for JavaScript errors
3. Check Network tab for failed API requests
4. Verify all files uploaded correctly
5. Check file permissions

## Security Checklist

- [ ] `.env.php` is not publicly accessible
- [ ] Database password is strong
- [ ] HTTPS is enabled on domain
- [ ] `init-db.php` is deleted after setup
- [ ] Regular backups are enabled
- [ ] PHP version is up to date
