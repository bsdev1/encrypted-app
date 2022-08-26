const express = require('express');
const passport = require('passport');
const { ensureAuthenticated, ensureNotAuthenticated } = require('../utils/auth');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const Message = require('../models/message');
const File = require('../models/file');
const { hash } = require('argon2');
const fs = require('fs/promises');

router.get('/', ensureAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

router.post('/login', ensureNotAuthenticated, (req, res, next) => {
  passport.authenticate('local', (err, user, messageObj) => {
    const errorMessage = messageObj?.message;
    if(err || !user) return res.json({ errorMessage });
    req.logIn(user, err => {
      if(err) return res.json({ errorMessage });
      res.json({ user });
    });
  })(req, res, next);
});

router.delete('/logout', ensureAuthenticated, (req, res) => {
  req.logOut(() => res.sendStatus(200));
});

router.post('/register', ensureNotAuthenticated, [
  check('username').isLength({ min: 6 }).withMessage('Username need at least 6 characters!').isLength({ max: 40 }).withMessage('Username is too long (max 40 characters).'),
  check('password').isLength({ min: 9 }).withMessage('Password need at least 9 characters!').isLength({ max: 80 }).withMessage('Password is too long (max 80 characters).'),
], async (req, res) => {
  let { username, password } = req.body;
  const errors = validationResult(req).errors.map(({ msg }) => msg);
  if(errors.length) return res.json({ errors });
  password = await hash(password);
  const { username: newUser } = await User.create({ username, password });
  res.json({ newUser });
});

router.get('/messages', ensureAuthenticated, async (req, res) => {
  const messages = await Message.find({ author: req.user.id }).populate('author');
  res.json({ messages });
});

router.get('/getFiles/:message', ensureAuthenticated, async (req, res) => {
  const files = await File.find({ message: req.params.message });

  const encryptedFiles = [];

  for(let file of files) {
    try {
      const encrypted_content = await fs.readFile(`./public/usersFiles/${file.uuid}.encrypted`);
      encryptedFiles.push({ ...file.toJSON(), encrypted_content });
    } catch {}
  }

  res.json(encryptedFiles);
});

module.exports = router;