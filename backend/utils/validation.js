const { check } = require('express-validator');

const registerRules = [
  check('username')
    .isLength({ min: 6 })
    .withMessage('Username need at least 6 characters!')
    .isLength({ max: 40 })
    .withMessage('Username is too long (max 40 characters).'),
  check('password')
    .isLength({ min: 9 })
    .withMessage('Password need at least 9 characters!')
    .isLength({ max: 80 })
    .withMessage('Password is too long (max 80 characters).'),
  check('token').isLength({ min: 1 }).withMessage('Captcha is invalid!'),
];

module.exports = { registerRules };
