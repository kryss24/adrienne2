const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middlewares/auth');
const { roleMiddleware } = require('../middlewares/roles');

// Helper for basic dashboard stats
function buildStats(filter = '') {
  const total = db.prepare(`SELECT COUNT(*) as c FROM requests ${filter}`).get().c;
  const byStatus = db.prepare(`SELECT status, COUNT(*) as c FROM requests ${filter} GROUP BY status`).all();
  return { total, byStatus };
}

// GET /api/stats/my-stats (student)
router.get('/my-stats', authMiddleware, roleMiddleware('student'), (req, res, next) => {
  try {
    const filter = `WHERE studentId = '${req.user.id}'`;
    res.json(buildStats(filter));
  } catch (err) { next(err); }
});

// GET /api/stats/class/:classId (admin)
router.get('/class/:classId', authMiddleware, roleMiddleware('admin','superadmin'), (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.classId);
      // if (!cls || cls.adminId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
    }
    const filter = `WHERE classId = '${req.params.classId}'`;
    res.json(buildStats(filter));
  } catch (err) { next(err); }
});

// GET /api/stats/global (superadmin)
router.get('/global', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => {
  try { res.json(buildStats('')); } catch (err) { next(err); }
});

module.exports = router;
