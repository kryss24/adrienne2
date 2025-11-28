const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');
const dbExists = fs.existsSync(DB_PATH);
const db = new Database(DB_PATH);

// enable foreign keys
db.pragma('foreign_keys = ON');

// Run migrations automatically if DB was not present
if (!dbExists) {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'migrations', 'schema.sql'), 'utf8');
  db.exec(sql);
}

module.exports = db;
