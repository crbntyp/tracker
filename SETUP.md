# Weight Tracker - Setup Guide

A cross-platform health tracker with Google authentication, running in Docker.

## Features

- Track weight, meals, and drinks
- Calendar view (homepage)
- Charts and analytics
- Google OAuth login
- Cross-browser compatible
- Secure cloud storage with PostgreSQL
- Runs in Docker for easy deployment

## Quick Start

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen if needed
6. Choose "Web application" as application type
7. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
8. Copy the Client ID and Client Secret

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Google credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Session Secret (generate a random string)
SESSION_SECRET=your-very-secret-random-string-here
```

### 3. Run with Docker

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The app will be available at: **http://localhost:3000**

### 4. First Time Setup

When you first access the app:
1. You'll be redirected to the login page
2. Click "Continue with Google"
3. Authenticate with your Google account
4. You'll be redirected to the Calendar homepage

## Architecture

```
┌─────────────┐
│   Browser   │
│ (Any Device)│
└──────┬──────┘
       │
       ├─ Frontend (HTML/CSS/JS)
       │  ├─ Calendar (Homepage)
       │  ├─ Dashboard
       │  └─ Charts
       │
       ├─ Backend (Node.js/Express)
       │  ├─ Google OAuth
       │  ├─ Session Management
       │  └─ API Routes
       │
       └─ Database (PostgreSQL)
          ├─ Users table
          └─ Entries table
```

## Docker Services

- **app**: Node.js application (port 3000)
- **db**: PostgreSQL database (port 5432)

## Development

### Without Docker

If you prefer to run without Docker:

```bash
# Install dependencies
npm install

# Start PostgreSQL locally
# Update .env with DB_HOST=localhost

# Initialize database
npm run init-db

# Start the server
npm run dev
```

## Database Schema

### Users Table
- `id`: Primary key
- `google_id`: Google OAuth ID (unique)
- `email`: User email
- `name`: Display name
- `picture`: Profile picture URL
- `settings`: JSONB (user preferences)

### Entries Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `date`: Entry date (unique per user)
- `weight`: JSONB (weight data)
- `lunch`: JSONB (lunch data)
- `dinner`: JSONB (dinner data)
- `drinks`: JSONB (drinks array)
- `notes`: Text field

## Security Notes

- Never commit your `.env` file
- Use strong SESSION_SECRET in production
- For production, use HTTPS and update callback URLs
- Set `NODE_ENV=production` in production

## Troubleshooting

### "Not authenticated" errors
- Make sure you're logged in
- Check that cookies are enabled
- Verify Google OAuth credentials are correct

### Database connection errors
- Ensure PostgreSQL container is running
- Check `DB_HOST` matches docker-compose service name
- Wait for database health check to pass

### Port already in use
- Stop other services on port 3000
- Or change PORT in docker-compose.yml

## Cross-Browser Access

Your data is stored in the cloud, so you can:
- Access from any browser
- Use different devices
- Your data stays in sync automatically

## Backup & Export

- Use the "Export Data" button in the Charts page
- Downloads a JSON file with all your data
- Keep regular backups for safety

## Production Deployment

For production deployment:
1. Use environment-specific `.env` files
2. Set up SSL/TLS certificates
3. Use production-grade PostgreSQL
4. Enable secure cookies (`NODE_ENV=production`)
5. Update Google OAuth callback URLs to your domain
