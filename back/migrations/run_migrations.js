const fs = require('fs');
const Database = require('better-sqlite3');
require('dotenv').config();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(sql);
console.log('Migrations applied.');
