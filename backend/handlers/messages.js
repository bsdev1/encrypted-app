const Message = require('../models/message');
const File = require('../models/file');
const fsDefault = require('fs');
const fs = require('fs/promises');

async function handleGetMessages(req, res) {
  const messages = await Message.find({ author: req.user.id }).populate(
    'author'
  );

  res.json({ messages });
}

async function handleGetFiles(req, res) {
  const files = await File.find({
    message: req.params.message,
    author: req.user.id,
  }).select('uuid fileType fileName -_id');

  res.json({ files });
}

async function handleEditMessage(req, res) {
  const { editMessageContent } = req.body;
  const message = await Message.findById(req.params.message);

  if (!message && message?.author != req.user.id)
    return res.json({ error: `Message doesn't exist.` });

  if (!editMessageContent?.trim())
    return res.json({ error: 'Edit message cannot be empty.' });

  message.content = editMessageContent;
  message.edited = true;
  await message.save();

  res.sendStatus(200);
}

async function handleRemoveMessage(req, res) {
  const id = req.params.message;
  const message = await Message.findById(id);

  if (!message && message?.author != req.user.id)
    return res.json({ error: `Message doesn't exist.` });

  const files = await File.find({ message: id, author: req.user.id });

  for (const { uuid } of files) {
    const path = `./public/usersFiles/${uuid}.encrypted`;
    if (fsDefault.existsSync(path)) await fs.unlink(path);
  }

  await message.remove();

  res.sendStatus(200);
}

module.exports = {
  handleGetMessages,
  handleGetFiles,
  handleEditMessage,
  handleRemoveMessage,
};
