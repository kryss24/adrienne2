const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { registerValidator, loginValidator } = require('../validators/validators');
const { sendEmail } = require('../utils/email');
require('dotenv').config();

router.post('/register', registerValidator, (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { matricule, password, firstName, lastName, role, email, classId } = req.body;
    const hashed = bcrypt.hashSync(password, 10);
    const id = uuidv4();

    const stmt = db.prepare('INSERT INTO users (id, matricule, firstName, lastName, email, password, role, classId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, matricule, firstName, lastName, email || null, hashed, role, classId || 1);

    const user = db.prepare('SELECT id, matricule, firstName, lastName, email, role, classId, createdAt FROM users WHERE id = ?').get(id);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ user, token });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(400).json({ message: 'Matricule déjà utilisé' });
    next(err);
  }
});

router.post('/login', loginValidator, (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { matricule, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE matricule = ?').get(matricule);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payloadUser = { id: user.id };
    const token = jwt.sign(payloadUser, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    const safeUser = db.prepare('SELECT id, matricule, firstName, lastName, email, role, classId, createdAt FROM users WHERE id = ?').get(user.id);
    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.json({ message: 'Si un compte existe, vous allez recevoir un lien de réinitialisation.' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Réinitialisation de mot de passe',
      text: `Bonjour,

Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}

Si vous n'avez pas demandé ceci, ignorez cet email.`
    });

    return res.json({ message: 'Email envoyé si le compte existe.' });
  } catch (err) {
    next(err);
  }
});

const { authMiddleware } = require('../middlewares/auth');
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;
