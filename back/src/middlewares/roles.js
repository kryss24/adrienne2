function roleMiddleware(...allowed) {
  return (req, res, next) => {
    console.log('Role Middleware - User:', req.user, 'Allowed Roles:', allowed);
    if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
    if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Accès refusé' });
    next();
  };
}

module.exports = { roleMiddleware };
