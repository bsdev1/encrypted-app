if(process.env.NODE_ENV != 'production') require('dotenv').config();

const express = require('express');
const passport = require('passport');
const { ensureAuthenticated, ensureNotAuthenticated } = require('../utils/auth');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const Message = require('../models/message');
const File = require('../models/file');
const { hash } = require('argon2');
const { verify } = require('hcaptcha');
const secret = process.env.NODE_ENV != 'production' ? '0x0000000000000000000000000000000000000000' : '0xd741f8041DaAf4AcF2AA802EE8C9307540874a83';
const fsDefault = require('fs');
const fs = require('fs/promises');

router.get('/', ensureAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

router.post('/login', ensureNotAuthenticated, async (req, res, next) => {
  const { token } = req.body;
  const { success } = await verify(secret, process.env.NODE_ENV != 'production' ? token : '10000000-aaaa-bbbb-cccc-000000000001');
  if(!success) return res.json({ errorMessage: 'Captcha is invalid!' });
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

if(process.env.enableRegister == '1') {
  router.post('/register', ensureNotAuthenticated, [
    check('username').isLength({ min: 6 }).withMessage('Username need at least 6 characters!').isLength({ max: 40 }).withMessage('Username is too long (max 40 characters).'),
    check('password').isLength({ min: 9 }).withMessage('Password need at least 9 characters!').isLength({ max: 80 }).withMessage('Password is too long (max 80 characters).'),
    check('token').isLength({ min: 1 }).withMessage('Captcha is invalid!').isLength({ max: 80 })
  ], async (req, res) => {
    let { username, password, token } = req.body;
    const errors = validationResult(req).errors.map(({ msg }) => msg);
    if(errors.length) return res.json({ errors });
    const { success } = await verify(secret, token);
    if(!success) return res.json({ errors: ['Captcha is invalid!'] });
    const userExists = await User.exists({ username });
    if(userExists) return res.json({ errors: ['User already exists!'] });
    password = await hash(password);
    const { username: newUser } = await User.create({ username, password });
    res.json({ newUser });
  });
} else {
  router.post('/register', ensureNotAuthenticated, (_, res) => res.json({ errors: ['Register is disabled by the administrator.'] }));
}

router.get('/messages', ensureAuthenticated, async (req, res) => {
  const messages = await Message.find({ author: req.user.id }).populate('author');
  res.json({ messages });
});

router.get('/getFiles/:message', ensureAuthenticated, async (req, res) => {
  const files = await File.find({ message: req.params.message, author: req.user.id }).select('uuid fileType fileName -_id');
  res.json({ files });
});

router.patch('/editMessage/:message', ensureAuthenticated, async (req, res) => {
  const { editMessageContent } = req.body;
  const message = await Message.findById(req.params.message);
  if(!message && message?.author != req.user.id) return res.json({ error: `Message doesn't exists.` });
  if(!editMessageContent?.trim()) return res.json({ error: 'Edit message cannot be empty.' });
  message.content = editMessageContent;
  message.edited = true;
  await message.save();
  res.json({ error: null });
});

router.delete('/removeMessage/:message', ensureAuthenticated, async (req, res) => {
  const id = req.params.message;
  const message = await Message.findById(id);
  if(!message && message?.author != req.user.id) return res.json({ error: `Message doesn't exists.` });
  const files = await File.find({ message: id, author: req.user.id });
  for(const { uuid } of files) {
    const path = `./public/usersFiles/${uuid}.encrypted`;
    if(fsDefault.existsSync(path)) await fs.unlink(path);
  }
  await message.remove();
  res.json({ error: null });
});

module.exports = router;