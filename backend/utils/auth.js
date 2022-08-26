const LocalStrategy = require('passport-local').Strategy;
const { verify } = require('argon2');
const User = require('../models/user');

const excludeParams = (obj, params) => Object.fromEntries(Object.entries(obj).filter(([param]) => !params.includes(param)));

function passportAuth(passport) {
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username }).select('username password').lean();
      const correctPassword = user ? await verify(user.password, password) : false;
      if(!correctPassword) return done(null, false, { message: 'Wrong credentials' });
      user.id = user._id.toString();
      delete user._id;
      done(null, excludeParams(user, ['password']));
    } catch (err) {
      console.log(err);
      done(null, false, { message: 'Something went wrong' });
    }
  }));

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
}

const ensureAuthenticated = (req, res, next) => req.isAuthenticated() ? next() : res.json({ success: false });
const ensureNotAuthenticated = (req, res, next) => req.isAuthenticated() ? res.redirect('/') : next();

module.exports = { ensureAuthenticated, ensureNotAuthenticated, passportAuth };