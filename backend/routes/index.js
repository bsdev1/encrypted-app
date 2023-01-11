if (process.env.NODE_ENV != 'production') require('dotenv').config();

const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../utils/auth');

router.get('/', ensureAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
