const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middlewares/auth');

router.get('/', authMiddleware, (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
    res.json(rows);
  } catch (err) { next(err); }
});

router.patch('/:id/read', authMiddleware, (req, res, next) => {
  try {
    const note = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
    if (!note) return res.status(404).json({ message: 'Notification introuvable' });
    if (note.userId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

router.patch('/mark-all-read', authMiddleware, (req, res, next) => {
  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE userId = ?').run(req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
