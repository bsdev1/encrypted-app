const { enableRegister } = process.env;

function isRegisterEnabled(_, res, next) {
  if (enableRegister == '0')
    return res.json({ errors: ['Register is disabled by the administrator.'] });

  next();
}

function parseErrors() {}

module.exports = { isRegisterEnabled, parseErrors };
