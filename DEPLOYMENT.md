# Deployment Guide

## Environment-Specific Configuration

This app requires different `.htaccess` configurations for local vs production environments due to different URL structures:

| Environment | URL Structure | RewriteBase |
|-------------|--------------|-------------|
| Local (Docker) | `localhost:8000/` | `/` |
| Production | `www.carbontype.co/tracker/` | `/tracker/` |

## .htaccess Setup

The `.htaccess` file is **NOT tracked in git** to prevent environment conflicts. Instead, use the template files:

### Local Development

```bash
# Copy the local template to create your .htaccess
cp src/static/.htaccess.local dist/.htaccess
```

### Production Deployment

```bash
# Copy the production template to your web server
cp src/static/.htaccess.production /path/to/tracker/.htaccess
```

Or manually copy `src/static/.htaccess.production` to your live server and rename it to `.htaccess`.

## Key Differences Between Templates

### .htaccess.local
- `RewriteBase /` - App runs at root
- `display_errors On` - Shows PHP errors for debugging

### .htaccess.production  
- `RewriteBase /tracker/` - App runs in subdirectory
- `display_errors Off` - Hides PHP errors for security

## Deployment Checklist

1. **Never commit `.htaccess` files** - They're in `.gitignore` for a reason
2. **Always use the correct template** for your environment
3. **After deploying code**, verify your `.htaccess` is still correct
4. **If you get 403/404 errors**, check your `.htaccess` RewriteBase setting

## Troubleshooting

### 403 Forbidden Error
- Check if `.htaccess` exists on server
- Verify `RewriteBase` matches your URL structure
- Ensure Apache `mod_rewrite` is enabled

### 404 Not Found for API endpoints
- API endpoints use `.php` extension directly (e.g., `/api/recent-foods.php`)
- Check the rewrite rules in `.htaccess`

### Site works locally but not on production
- 99% of the time this is a `RewriteBase` mismatch
- Local uses `/`, production uses `/tracker/`
