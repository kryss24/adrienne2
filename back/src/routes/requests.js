const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middlewares/auth');
const { roleMiddleware } = require('../middlewares/roles');
const upload = require('../utils/upload');
const { validationResult } = require('express-validator');
const { requestCreateValidator } = require('../validators/validators');
const { createNotification } = require('../helpers/notifications');

// POST /api/requests/  (student only)
router.post('/', authMiddleware, roleMiddleware('student'), upload.array('attachments', 5), requestCreateValidator, (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { subject, type, description } = req.body;
    const files = (req.files || []).map(f => f.path.replace(/\\/g, '/'));


    const student = req.user;
    if (!student.classId) return res.status(400).json({ message: 'L\'étudiant n\'appartient à aucune classe' });

    const classRow = db.prepare('SELECT id, name, adminId FROM classes WHERE id = ?').get(student.classId);
    if (!classRow) return res.status(400).json({ message: 'Classe introuvable' });

    const id = uuidv4();
    const stmt = db.prepare(`INSERT INTO requests (id, studentId, studentName, studentMatricule, classId, className, subject, type, description, attachments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(id, student.id, `${student.firstName} ${student.lastName}`, student.matricule, classRow.id, classRow.name, subject, type, description, JSON.stringify(files));

    const created = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);

    console.log('Created request:', created," Files:", files, " Student:", student);
    // notify student
    createNotification(student.id, id, 'Requête créée');
    // notify admin if exists
    if (classRow.adminId) {
      createNotification(classRow.adminId, id, 'Nouvelle requête dans votre classe');
    }

    res.json(created);
  } catch (err) {
    next(err);
  }
});

// GET /api/requests/my-requests
router.get('/my-requests', authMiddleware, roleMiddleware('student'), (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM requests WHERE studentId = ? ORDER BY createdAt DESC').all(req.user.id);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/requests/class/:classId  (admin or superadmin)
router.get('/class/:classId', authMiddleware, roleMiddleware('admin', 'superadmin'), (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM requests WHERE classId = ? ORDER BY createdAt DESC').all(req.params.classId);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/requests/ (superadmin)
router.get('/', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM requests ORDER BY createdAt DESC').all();
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/requests/:id
router.get('/:id', authMiddleware, (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ message: 'Requête introuvable' });
    if (req.user.role === 'student' && row.studentId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
    if (req.user.role === 'admin') {
      const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(row.classId);
      // if (!cls || cls.adminId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
    }
    res.json(row);
  } catch (err) { next(err); }
});

// PATCH /api/requests/:id/status  (admin / superadmin)
router.patch('/:id/status', authMiddleware, roleMiddleware('admin', 'superadmin'), (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const valid = ['pending','in_progress','validated','rejected','transmitted'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Status invalide' });

    const reqRow = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);
    if (!reqRow) return res.status(404).json({ message: 'Requête introuvable' });

    if (req.user.role === 'admin') {
      const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(reqRow.classId);
      // if (!cls || cls.adminId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
    }

    const stmt = db.prepare('UPDATE requests SET status = ?, updatedAt = datetime(\'now\'), processedBy = ?, processedAt = datetime(\'now\'), rejectionReason = ? WHERE id = ?');
    stmt.run(status, req.user.id, rejectionReason || null, req.params.id);

    const updated = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);

    let message = `Le statut de votre requête a été mis à jour: ${status}`;
    if (status === 'validated') message = 'Votre requête a été validée.';
    if (status === 'rejected') message = `Votre requête a été rejetée. Raison: ${rejectionReason || 'non précisée'}`;

    createNotification(updated.studentId, updated.id, message);

    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/requests/:id
router.delete('/:id', authMiddleware, (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ message: 'Requête introuvable' });

    if (req.user.role === 'student' && row.studentId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
    if (req.user.role === 'admin') {
      const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(row.classId);
      // if (!cls || cls.adminId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
    }

    db.prepare('DELETE FROM requests WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
