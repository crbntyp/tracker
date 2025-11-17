# Weight Tracker - Dockerized Cloud Edition

A modern, cross-platform health tracking application with Google authentication, running entirely in Docker.

## What's New

- **Docker-based deployment** - Everything runs in containers
- **Google OAuth login** - Secure authentication
- **Cloud storage** - PostgreSQL database for cross-device sync
- **Calendar as homepage** - Quick access to your weekly view
- **Navigation bar** - Easy navigation across all pages
- **Cross-browser compatible** - Access your data from anywhere

## Quick Start (3 steps)

### 1. Get Google OAuth Credentials

Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and:
- Create OAuth 2.0 Client ID
- Add redirect URI: `http://localhost:3000/auth/google/callback`
- Copy Client ID and Secret

### 2. Configure `.env`

```bash
# Edit .env file and add your credentials
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
SESSION_SECRET=any-random-string-here
```

### 3. Start Docker

```bash
docker-compose up --build
```

Visit: **http://localhost:3000**

## Project Structure

```
tracker/
├── server/                 # Backend (Node.js/Express)
│   ├── server.js          # Main server & auth
│   ├── db.js              # Database functions
│   └── init-db.js         # Database initialization
├── js/                    # Frontend JavaScript
│   ├── data.js            # API wrapper
│   ├── nav.js             # Navigation component
│   ├── calendar.js        # Calendar logic
│   ├── charts.js          # Charts & analytics
│   └── ui.js              # UI interactions
├── css/                   # Stylesheets (SCSS)
├── calendar.html          # Homepage (calendar view)
├── dashboard.html         # Quick actions
├── charts.html            # Analytics & charts
├── login.html             # Google login page
├── docker-compose.yml     # Docker services
├── Dockerfile             # App container
└── .env                   # Configuration

## Features

### Authentication
- Google OAuth 2.0 integration
- Secure session management
- Cross-device login

### Pages
1. **Calendar** (Homepage) - Weekly view with day details
2. **Dashboard** - Quick data entry (weight, meals, drinks)
3. **Charts** - Weight trends and statistics

### Data Tracking
- Weight measurements (kg/lbs)
- Lunch entries (description, calories)
- Dinner entries (description, calories)
- Drinks tracking (type, amount)

### Navigation
- Sticky navigation bar on all pages
- User profile display
- Easy logout

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/logout` - Logout
- `GET /auth/user` - Get current user

### Data
- `GET /api/entries` - Get all entries
- `GET /api/entries/:date` - Get entry by date
- `POST /api/entries` - Save/update entry
- `DELETE /api/entries/:date` - Delete entry
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update settings

## Docker Services

### app
- Node.js 18 Alpine
- Express server
- Port 3000

### db
- PostgreSQL 15 Alpine
- Persistent volume
- Port 5432

## Database Schema

See [SETUP.md](./SETUP.md) for detailed schema information.

## Development

### Run without Docker

```bash
npm install
npm run init-db
npm run dev
```

### Compile SCSS

```bash
sass css/styles.scss css/styles.css --watch
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `SESSION_SECRET` | Session encryption key | (required) |
| `DB_HOST` | Database host | db |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | tracker |
| `DB_USER` | Database user | tracker_user |
| `DB_PASSWORD` | Database password | tracker_password |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | (required) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | (required) |

## Security

- Sessions encrypted with secret key
- HTTPS recommended for production
- Credentials stored in `.env` (git-ignored)
- SQL injection protection via parameterized queries
- CORS enabled for specified origins

## Troubleshooting

**Database won't connect:**
- Wait for health check: `docker-compose logs db`
- Verify credentials in `.env`

**Google OAuth fails:**
- Check Client ID and Secret
- Verify redirect URI in Google Console
- Ensure cookies are enabled

**Port 3000 in use:**
- Change `PORT` in docker-compose.yml
- Update Google OAuth redirect URI

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `SESSION_SECRET`
3. Enable HTTPS
4. Update Google OAuth URLs
5. Use managed PostgreSQL
6. Set up backups

## Next Steps

- Set up automated backups
- Add email notifications
- Implement data import/export
- Add more chart types
- Mobile app version

## Support

For detailed setup instructions, see [SETUP.md](./SETUP.md)
