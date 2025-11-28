const db = require('../db');
const { v4: uuidv4 } = require('uuid');

function createNotification(userId, requestId, message) {
  const id = uuidv4();
  const stmt = db.prepare('INSERT INTO notifications (id, userId, requestId, message) VALUES (?, ?, ?, ?)');
  stmt.run(id, userId, requestId, message);
  return { id, userId, requestId, message };
}

module.exports = { createNotification };
