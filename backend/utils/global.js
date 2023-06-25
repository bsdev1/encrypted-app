const { enableRegister } = process.env;
const File = require('../models/file');
const Message = require('../models/message');
const fs = require('fs/promises');
const fsDefault = require('fs');

function isRegisterEnabled(_, res, next) {
  if (enableRegister == '0')
    return res.json({ errors: ['Register is disabled by the administrator.'] });

  next();
}

async function removeExpiredMessages() {
  let files = await File.find({}).populate('message', 'createdAt expiration');

  files = files.filter(
    (file) =>
      file?.message &&
      Date.now() - file.message.createdAt.getTime() >= file.message.expiration
  );

  for (const file of files) {
    const path = `./public/usersFiles/${file.uuid}.encrypted`;
    if (fsDefault.existsSync(path)) await fs.unlink(path);
    await file.remove();
  }

  let messages = await Message.find({});

  messages = messages.filter(
    (message) => Date.now() - message.createdAt.getTime() >= message.expiration
  );

  for (const message of messages) await message.remove();
}

module.exports = { isRegisterEnabled, removeExpiredMessages };
