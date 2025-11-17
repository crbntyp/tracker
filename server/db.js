const { Pool } = require('pg');

// Support Railway's DATABASE_URL or individual env vars
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        host: process.env.DB_HOST || 'db',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'tracker',
        user: process.env.DB_USER || 'tracker_user',
        password: process.env.DB_PASSWORD || 'tracker_password'
      }
);

// User functions
async function getUserByGoogleId(googleId) {
  const result = await pool.query(
    'SELECT * FROM users WHERE google_id = $1',
    [googleId]
  );
  return result.rows[0];
}

async function getUserById(id) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function createUser(userData) {
  const { googleId, email, name, picture } = userData;
  const result = await pool.query(
    'INSERT INTO users (google_id, email, name, picture) VALUES ($1, $2, $3, $4) RETURNING *',
    [googleId, email, name, picture]
  );
  return result.rows[0];
}

// Entry functions
async function getEntries(userId) {
  const result = await pool.query(
    'SELECT * FROM entries WHERE user_id = $1 ORDER BY date DESC',
    [userId]
  );
  return result.rows.map(row => ({
    date: row.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    weight: row.weight,
    lunch: row.lunch,
    dinner: row.dinner,
    drinks: row.drinks,
    notes: row.notes
  }));
}

async function getEntryByDate(userId, date) {
  const result = await pool.query(
    'SELECT * FROM entries WHERE user_id = $1 AND date = $2',
    [userId, date]
  );

  if (result.rows.length === 0) {
    return {
      date: date,
      weight: null,
      lunch: { logged: false },
      dinner: { logged: false },
      drinks: [],
      notes: ''
    };
  }

  const row = result.rows[0];
  return {
    date: row.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    weight: row.weight,
    lunch: row.lunch,
    dinner: row.dinner,
    drinks: row.drinks,
    notes: row.notes
  };
}

async function saveEntry(userId, entryData) {
  const { date, weight, lunch, dinner, drinks, notes } = entryData;

  const result = await pool.query(
    `INSERT INTO entries (user_id, date, weight, lunch, dinner, drinks, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id, date)
     DO UPDATE SET
       weight = COALESCE($3, entries.weight),
       lunch = COALESCE($4, entries.lunch),
       dinner = COALESCE($5, entries.dinner),
       drinks = COALESCE($6, entries.drinks),
       notes = COALESCE($7, entries.notes)
     RETURNING *`,
    [userId, date, weight, lunch, dinner, drinks, notes]
  );

  const row = result.rows[0];
  return {
    ...row,
    date: row.date.toISOString().split('T')[0] // Format as YYYY-MM-DD
  };
}

async function deleteEntry(userId, date) {
  await pool.query(
    'DELETE FROM entries WHERE user_id = $1 AND date = $2',
    [userId, date]
  );
}

// Settings functions
async function getSettings(userId) {
  const result = await pool.query(
    'SELECT settings FROM users WHERE id = $1',
    [userId]
  );

  return result.rows[0]?.settings || {
    weightUnit: 'kg',
    notificationsEnabled: false
  };
}

async function updateSettings(userId, settings) {
  const result = await pool.query(
    'UPDATE users SET settings = $1 WHERE id = $2 RETURNING settings',
    [JSON.stringify(settings), userId]
  );

  return result.rows[0]?.settings || settings;
}

module.exports = {
  getUserByGoogleId,
  getUserById,
  createUser,
  getEntries,
  getEntryByDate,
  saveEntry,
  deleteEntry,
  getSettings,
  updateSettings
};
