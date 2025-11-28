const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../db');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ message: 'Token manquant' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT id, matricule, firstName, lastName, email, role, classId, createdAt FROM users WHERE id = ?').get(payload.id);
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}

module.exports = { authMiddleware };
