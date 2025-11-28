const { body } = require('express-validator');

const registerValidator = [
  body('matricule').isString().notEmpty(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('role').isIn(['student', 'admin', 'superadmin'])
];

const loginValidator = [
  body('matricule').notEmpty(),
  body('password').notEmpty()
];

const requestCreateValidator = [
  body('subject').notEmpty(),
  body('type').isIn(['note_manquante', 'erreur_saisie', 'incoherence', 'autre']),
  body('description').notEmpty()
];

module.exports = { registerValidator, loginValidator, requestCreateValidator };
