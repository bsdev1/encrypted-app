const { hash } = require('argon2');
const { validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/user');
const { NODE_ENV, captchaSecret } = process.env;
const { verify } = require('hcaptcha');

const secret =
  process.env.NODE_ENV != 'production'
    ? '0x0000000000000000000000000000000000000000'
    : captchaSecret;

async function handleLogin(req, res, next) {
  let { token } = req.body;

  token =
    NODE_ENV != 'production' ? '10000000-aaaa-bbbb-cccc-000000000001' : token;

  const { success } = await verify(secret, token);
  if (!success) return res.json({ errorMessage: 'Captcha is invalid!' });

  passport.authenticate('local', (err, user, messageObj) => {
    const errorMessage = messageObj?.message;
    if (err || !user) return res.json({ errorMessage });

    req.logIn(user, (err) => {
      if (err) return res.json({ errorMessage });
      res.json({ user });
    });
  })(req, res, next);
}

async function handleRegister(req, res) {
  let { username, password, token } = req.body;

  let { errors } = validationResult(req);
  errors = errors.map(({ msg }) => msg);

  if (errors.length) return res.json({ errors });

  const { success } = await verify(secret, token);
  if (!success) return res.json({ errors: ['Captcha is invalid!'] });

  const userExists = await User.exists({ username });
  if (userExists) return res.json({ errors: ['User already exists!'] });

  password = await hash(password);

  const { username: newUser } = await User.create({
    username,
    password,
  });

  res.json({ newUser });
}

module.exports = { handleRegister, handleLogin };
