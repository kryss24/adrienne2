const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middlewares/auth');
const { roleMiddleware } = require('../middlewares/roles');

// GET /api/classes/  (superadmin)
router.get('/', (req, res, next) => {
  try { const rows = db.prepare('SELECT * FROM classes').all(); res.json(rows); } catch (err) { next(err); }
});

// GET /api/classes/:id
router.get('/:id', authMiddleware, (req, res, next) => {
  try { const row = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id); if (!row) return res.status(404).json({ message: 'Classe introuvable' }); res.json(row); } catch (err) { next(err); }
});

// POST /api/classes  (superadmin)
router.post('/', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => {
  try {
    const { name, adminId } = req.body;
    if (!name || !adminId) return res.status(400).json({ message: 'name & adminId requis' });
    const id = uuidv4();
    db.prepare('INSERT INTO classes (id, name, adminId) VALUES (?, ?, ?)').run(id, name, adminId);
    const created = db.prepare('SELECT * FROM classes WHERE id = ?').get(id);
    res.json(created);
  } catch (err) { next(err); }
});

// PATCH /api/classes/:id  (superadmin)
router.patch('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => {
  try {
    const fields = [];
    const values = [];
    ['name','adminId','studentCount'].forEach(k => {
      if (req.body[k] !== undefined) { fields.push(`${k} = ?`); values.push(req.body[k]); }
    });
    if (!fields.length) return res.status(400).json({ message: 'Rien à mettre à jour' });
    values.push(req.params.id);
    db.prepare(`UPDATE classes SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    const updated = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/classes/:id  (superadmin)
router.delete('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => {
  try { db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id); res.status(204).send(); } catch (err) { next(err); }
});

module.exports = router;
