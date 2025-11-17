# Resolve - Weight Tracker

Dark-themed weight tracking app with Google OAuth authentication.

## Tech Stack

- **Frontend:** HTML, CSS (SCSS), Vanilla JavaScript
- **Backend:** PHP 7.4+
- **Database:** MySQL
- **Auth:** Google OAuth 2.0
- **Hosting:** cPanel (GoDaddy)

## Features

- Weight tracking with calendar and chart views
- Google OAuth login
- Dark theme with steel gray/carbon black palette
- Mobile-responsive design
- Icon-only mobile navigation

## Quick Start

### For Development

1. Install dependencies:
```bash
npm install
```

2. Build frontend:
```bash
npm run build
```

3. Start dev environment (with live reload):
```bash
npm run dev
```

### For cPanel Deployment

1. Build deployment package:
```bash
./build-php.sh
```

2. Follow the deployment guide:
   - See [DEPLOYMENT-CPANEL.md](DEPLOYMENT-CPANEL.md) for step-by-step instructions
   - See [php/README-PHP.md](php/README-PHP.md) for technical documentation

3. Upload `tracker-php-deploy.zip` to your cPanel

4. Configure `.env.php` with your database and Google OAuth credentials

5. Visit `/tracker/database/init-db.php` to create database tables

## Project Structure

```
/src                    # Source files (edit these)
  /scss                 # SCSS files
  /js                   # JavaScript files
  /*.html              # HTML files

/php                    # PHP backend
  /api                  # REST API endpoints
  /auth                 # Google OAuth handlers
  /includes             # Database & config
  /database             # Schema & init scripts

/dist                   # Built files (auto-generated)
```

## Development

```bash
# Build once
npm run build

# Watch for changes (auto-rebuild)
npm run dev

# Build deployment package
./build-php.sh
```

## Deployment URL

Production: https://www.carbontype.co/tracker

## License

MIT
