const { handleLogin, handleRegister } = require('../handlers/auth');
const {
  ensureNotAuthenticated,
  ensureAuthenticated,
} = require('../utils/auth');
const { isRegisterEnabled } = require('../utils/global');
const { registerRules } = require('../utils/validation');
const express = require('express');
const router = express.Router();

router.post('/login', ensureNotAuthenticated, handleLogin);

router.delete('/logout', ensureAuthenticated, (req, res) => {
  req.logOut(() => res.sendStatus(200));
});

router.post(
  '/register',
  ensureNotAuthenticated,
  registerRules,
  isRegisterEnabled,
  handleRegister
);

module.exports = router;
