const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for Google OAuth
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../dist')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback - Profile:', profile.id, profile.emails[0].value);

      // Check if user exists
      let user = await db.getUserByGoogleId(profile.id);

      if (!user) {
        console.log('Creating new user');
        // Create new user
        user = await db.createUser({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0]?.value
        });
      }

      console.log('User authenticated:', user.email);
      return done(null, user);
    } catch (error) {
      console.error('OAuth error:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user:', id);
    const user = await db.getUserById(id);
    console.log('Deserialized user:', user?.email);
    done(null, user);
  } catch (error) {
    console.error('Deserialize error:', error);
    done(error, null);
  }
});

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    // Ensure session is saved before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
      res.redirect('/');
    });
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/login.html');
  });
});

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// API routes
app.get('/api/entries', isAuthenticated, async (req, res) => {
  console.log('GET /api/entries - User:', req.user.email);
  try {
    const entries = await db.getEntries(req.user.id);
    console.log('Returning', entries.length, 'entries');
    res.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

app.get('/api/entries/:date', isAuthenticated, async (req, res) => {
  try {
    const entry = await db.getEntryByDate(req.user.id, req.params.date);
    res.json(entry);
  } catch (error) {
    console.error('Error fetching entry:', error);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

app.post('/api/entries', isAuthenticated, async (req, res) => {
  console.log('POST /api/entries - User:', req.user.email, 'Data:', JSON.stringify(req.body));
  try {
    const entry = await db.saveEntry(req.user.id, req.body);
    console.log('Entry saved successfully');
    res.json(entry);
  } catch (error) {
    console.error('Error saving entry:', error);
    res.status(500).json({ error: 'Failed to save entry' });
  }
});

app.delete('/api/entries/:date', isAuthenticated, async (req, res) => {
  try {
    await db.deleteEntry(req.user.id, req.params.date);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

app.get('/api/settings', isAuthenticated, async (req, res) => {
  try {
    const settings = await db.getSettings(req.user.id);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings', isAuthenticated, async (req, res) => {
  try {
    const settings = await db.updateSettings(req.user.id, req.body);
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Serve HTML files
app.get('/', (req, res) => {
  console.log('Root route - Authenticated:', req.isAuthenticated(), 'User:', req.user?.email);
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, '../dist/calendar.html'));
  } else {
    res.sendFile(path.join(__dirname, '../dist/login.html'));
  }
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/login.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
