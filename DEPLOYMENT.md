# Deployment Guide

## Environment-Specific Configuration

This app requires different `.htaccess` configurations for local vs production environments due to different URL structures:

| Environment | URL Structure | RewriteBase |
|-------------|--------------|-------------|
| Local (Docker) | `localhost:8000/` | `/` |
| Production | `www.crbntyp.com/trckr/` | `/trckr/` |

## .htaccess Setup

The build process (`node build.js`) automatically copies `.htaccess.production` as `.htaccess` in the `dist/` folder. This means:

- **Production builds include the correct .htaccess automatically**
- The `.htaccess` file is still NOT tracked in git
- Template files are kept for reference/modification

### Local Development

For local development, you may need to swap to the local template:

```bash
# After running build, replace with local template if needed
cp src/static/.htaccess.local dist/.htaccess
```

### Production Deployment

The build automatically includes the production `.htaccess`. Just deploy the `dist/` folder contents.

## Key Differences Between Templates

### .htaccess.local
- `RewriteBase /` - App runs at root
- `display_errors On` - Shows PHP errors for debugging

### .htaccess.production
- `RewriteBase /trckr/` - App runs in subdirectory
- `display_errors Off` - Hides PHP errors for security
- Includes `AddType` directive to ensure PHP files are executed

## Deployment Checklist

1. Run `node build.js` to create the dist folder
2. Deploy the contents of `dist/` to your server
3. Verify `.htaccess` was included in the deployment
4. **If you get 403/404 errors**, check your `.htaccess` RewriteBase setting

## Troubleshooting

### PHP files are downloading instead of executing
- Check if `.htaccess` exists on server
- Verify Apache has `mod_php` or PHP-FPM configured
- The `.htaccess` includes `AddType application/x-httpd-php .php` which should help

### 403 Forbidden Error
- Check if `.htaccess` exists on server
- Verify `RewriteBase` matches your URL structure
- Ensure Apache `mod_rewrite` is enabled

### 404 Not Found for API endpoints
- API endpoints use `.php` extension directly (e.g., `/api/recent-foods.php`)
- Check the rewrite rules in `.htaccess`

### Site works locally but not on production
- 99% of the time this is a `RewriteBase` mismatch
- Local uses `/`, production uses `/trckr/`
