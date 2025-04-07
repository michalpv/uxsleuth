const { Pool } = require('pg');

const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
};

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL pool');
});

pool.on('remove', () => {
  console.log('Client removed from the pool');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query:', { text, duration, rowCount: res.rowCount });
    return res;
  } catch (err) {
    throw err;
  }
}

// Only really needed for postgres transactions and listen/notify stuff; for regular (non-transactional) queries use the query function
async function getClient() {
  const client = await pool.connect();
  return client;
};

module.exports = {
  query,
  getClient,
};