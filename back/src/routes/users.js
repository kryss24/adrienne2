const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middlewares/auth');
const { roleMiddleware } = require('../middlewares/roles');

// all endpoints require superadmin
router.use(authMiddleware, roleMiddleware('superadmin'));

router.get('/', (req, res, next) => {
  try { const rows = db.prepare('SELECT id, matricule, firstName, lastName, email, role, classId, createdAt FROM users').all(); res.json(rows); } catch (err) { next(err); }
});

router.get('/:id', (req, res, next) => {
  try { const row = db.prepare('SELECT id, matricule, firstName, lastName, email, role, classId, createdAt FROM users WHERE id = ?').get(req.params.id); if (!row) return res.status(404).json({ message: 'Utilisateur introuvable' }); res.json(row); } catch (err) { next(err); }
});

router.patch('/:id', (req, res, next) => {
  try {
    const fields = [];
    const values = [];
    ['matricule','firstName','lastName','email','role','classId'].forEach(k => { if (req.body[k] !== undefined) { fields.push(`${k} = ?`); values.push(req.body[k]); } });
    if (req.body.password) { fields.push('password = ?'); const bcrypt = require('bcryptjs'); values.push(bcrypt.hashSync(req.body.password, 10)); }
    if (!fields.length) return res.status(400).json({ message: 'Rien à mettre à jour' });
    values.push(req.params.id);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    const updated = db.prepare('SELECT id, matricule, firstName, lastName, email, role, classId, createdAt FROM users WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', (req, res, next) => {
  try { db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id); res.status(204).send(); } catch (err) { next(err); }
});

module.exports = router;
