<div align="center">
  <img src="logo.png" alt="Resolve Logo" width="200">

  # Resolve

  A dark-themed fitness tracking application with Google OAuth authentication. Track your weight, gym attendance, supplements, steps, and daily diary entries.
</div>

## Screenshots

<div align="center">
  <img src="gitimgs/Screenshot 2025-11-17 at 21.30.24.png" alt="Calendar View" width="45%">
  <img src="gitimgs/Screenshot 2025-11-17 at 21.30.36.png" alt="Charts View" width="45%">
</div>

<div align="center">
  <img src="gitimgs/Screenshot 2025-11-17 at 21.30.45.png" alt="Details View" width="45%">
</div>

## Features

- 📊 **Weight Tracking** - Log daily weight with time stamps
- 🏋️ **Gym Attendance** - Track workout days
- 💊 **Supplements** - Record daily supplement intake
- 🚶 **Step Counter** - Log daily steps
- 📝 **Daily Diary** - Keep journal entries for each day
- 📅 **Calendar Views** - Week and month view with visual indicators
- 📈 **Charts** - Visualize your progress over time
- 🔐 **Google OAuth** - Secure authentication
- 🎨 **Dark Theme** - Modern muscle car-inspired design
- 📱 **Mobile Responsive** - Works on all devices

## Tech Stack

- **Frontend:** HTML, SCSS, Vanilla JavaScript
- **Backend:** PHP 8.2+
- **Database:** MySQL 8.0+
- **Authentication:** Google OAuth 2.0
- **Development:** Docker (optional)

## Getting Started

### Local Development with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd tracker
```

2. Create environment configuration:
```bash
cp .env.local.php .env.php
```

3. Edit `.env.php` with your credentials:
```php
<?php
putenv('DB_HOST=your-database-host');
putenv('DB_NAME=your-database-name');
putenv('DB_USER=your-database-user');
putenv('DB_PASS=your-database-password');
putenv('GOOGLE_CLIENT_ID=your-google-client-id');
putenv('GOOGLE_CLIENT_SECRET=your-google-client-secret');
putenv('GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback.php');
putenv('BASE_URL='); // Empty for local
```

4. Start Docker container:
```bash
docker-compose up -d
```

5. Initialize database:
```bash
# Visit http://localhost:8000/database/init-db.php
```

6. Access the app:
```bash
# Open http://localhost:8000
```

### Frontend Development

Build SCSS and copy assets:
```bash
./build-php.sh
```

The build script compiles:
- SCSS → CSS
- Copies HTML files from `src/` to root
- Copies JS files from `src/js/` to `js/`

## Project Structure

```
tracker/
├── api/                    # REST API endpoints
│   ├── entries.php        # CRUD for tracking entries
│   └── settings.php       # User settings
├── auth/                   # Authentication
│   ├── google.php         # OAuth initiation
│   ├── callback.php       # OAuth callback handler
│   ├── logout.php         # Logout handler
│   └── user.php           # User info endpoint
├── includes/               # Core PHP
│   ├── config.php         # Configuration
│   ├── Database.php       # Database class
│   └── auth.php           # Auth helpers
├── database/               # Database files
│   ├── schema.sql         # Table definitions
│   └── init-db.php        # Database initialization
├── src/                    # Source files (edit these)
│   ├── scss/              # SCSS stylesheets
│   ├── js/                # JavaScript modules
│   ├── calendar.html      # Calendar page
│   ├── charts.html        # Charts page
│   └── login.html         # Login page
├── css/                    # Compiled CSS (auto-generated)
├── js/                     # Compiled JS (auto-generated)
├── *.html                  # Compiled HTML (auto-generated)
├── .env.php               # Environment config (gitignored)
├── .htaccess              # Apache rewrite rules
└── index.php              # Entry point
```

## Database Schema

The app uses a single `entries` table with JSON columns for structured data:

- `weight` - JSON: `{value, unit, time, timestamp}`
- `diary` - TEXT
- `gym` - BOOLEAN
- `supplements` - TEXT
- `steps` - INT

## Configuration

### Google OAuth Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - Local: `http://localhost:8000/auth/callback.php`
   - Production: `https://yourdomain.com/auth/callback.php`
5. Add credentials to `.env.php`

### Environment Variables

Create `.env.php` with the following:

```php
<?php
putenv('DB_HOST=localhost');
putenv('DB_NAME=your_db_name');
putenv('DB_USER=your_db_user');
putenv('DB_PASS=your_db_password');
putenv('GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com');
putenv('GOOGLE_CLIENT_SECRET=your_client_secret');
putenv('GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback.php');
putenv('BASE_URL='); // Empty for root path, '/tracker' for subfolder
```

## Production Deployment

### cPanel/Shared Hosting

1. Build the frontend:
```bash
./build-php.sh
```

2. Upload these files via FTP:
   - `api/`
   - `auth/`
   - `includes/`
   - `css/`
   - `js/`
   - `*.html`
   - `*.php`
   - `logo.png`
   - `manifest.json`
   - `sw.js`

3. **DO NOT upload:**
   - `src/` (source files)
   - `database/` (contains init scripts)
   - `node_modules/`
   - `.git/`
   - `docker-compose.yml`, `Dockerfile`
   - `.env*` files

4. Create `.env.php` on the server with production credentials

5. Create `.htaccess` on the server (if deploying to subfolder):
```apache
RewriteEngine On
RewriteBase /tracker/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/$1 [L]
RewriteRule ^auth/(.*)$ auth/$1 [L]
```

6. Initialize database using MySQL client or phpMyAdmin:
```bash
# Run the SQL from database/schema.sql
```

### Docker Production

See `docker-compose.yml` for production Docker setup.

## Development Tips

### Local vs Production Paths

The app auto-detects the base path:
- Local: Runs at root (`http://localhost:8000/`)
- Production: Can run in subfolder (e.g., `/tracker/`)

Set `BASE_URL` in `.env.php`:
- Local: `putenv('BASE_URL=');` (empty string)
- Production subfolder: `putenv('BASE_URL=/tracker');`

### SCSS Development

Edit files in `src/scss/` then build:
```bash
./build-php.sh
```

SCSS files:
- `_variables.scss` - Colors, fonts, spacing
- `_layout.scss` - Page structure
- `_components.scss` - Reusable components
- `_calendar.scss` - Calendar-specific styles
- `_charts.scss` - Chart-specific styles

### JavaScript Modules

- `config.js` - Path configuration
- `data.js` - API communication & caching
- `utils.js` - Date/time utilities
- `calendar.js` - Calendar view logic
- `charts.js` - Chart rendering
- `ui.js` - Modal and form handlers
- `nav.js` - Navigation component
- `bg-rotator.js` - Background image rotation

## API Endpoints

All endpoints require authentication (session-based).

### Entries
- `GET /api/entries` - Get all entries
- `GET /api/entries?date=YYYY-MM-DD` - Get entry by date
- `POST /api/entries` - Create/update entry
- `DELETE /api/entries/:date` - Delete entry

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update settings

### Auth
- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/callback` - OAuth callback
- `GET /auth/user` - Get current user
- `GET /auth/logout` - Logout

## Security

- ✅ Google OAuth 2.0 for authentication
- ✅ Session-based auth (httponly cookies)
- ✅ Prepared statements (SQL injection prevention)
- ✅ Input validation and sanitization
- ✅ HTTPS recommended for production
- ✅ Environment variables for secrets

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note:** This is a personal fitness tracking app. Ensure you comply with data privacy regulations (GDPR, etc.) if deployed for public use.
