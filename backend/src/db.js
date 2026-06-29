const { Pool } = require('pg');
require('dotenv').config();

// Initialize a new connection pool using environment variables in env file.
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error connecting to the database:', err.stack);
  }
  console.log('Successfully connected to the PostgreSQL database!');
  
  release(); 
});

module.exports = pool;