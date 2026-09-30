// PostgreSQL connection configuration will be added in Phase 3.

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ARYA',
  password: process.env.DB_PASSWORD || '7748',
  port: process.env.DB_PORT || 7000,
});

module.exports = { pool };