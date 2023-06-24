const Message = require('../models/message');
const File = require('../models/file');
const fsDefault = require('fs');
const fs = require('fs/promises');
const { MESSAGES_PAGINATION_NUMBER } = require('../../shared/constants');
const { removeExpiredMessages } = require('../utils/global');

async function handleGetMessages(req, res) {
  const messageLimit = MESSAGES_PAGINATION_NUMBER;

  const messagesCount = await Message.countDocuments({
    author: req.user.id,
  }).lean();

  const paginationLeft = Math.ceil(messagesCount / messageLimit);

  let page = req.query.page;

  if ((isNaN(page) || page > paginationLeft) && page != 'all')
    return res.json({ messages: [] });

  if (page == 'all') {
    const messages = await Message.find({ author: req.user.id }).populate(
      'author'
    );

    return res.json({ messages });
  }

  page = parseInt(page);

  const skipMessagesNum = messagesCount - messageLimit * page;

  const messages = await Message.find({ author: req.user.id })
    .populate('author')
    .skip(skipMessagesNum < 1 ? 0 : skipMessagesNum)
    .limit(
      skipMessagesNum < 1
        ? messagesCount - messageLimit * (page - 1)
        : messageLimit
    );

  const isLastPagination = paginationLeft - page == 0;

  const data = { messages };

  if (isLastPagination) data.isLastPagination = true;
  if (page == 1) data.messagesCount = messagesCount;

  res.json(data);
}

async function handleNukeAllMessages(req, res) {
  const files = await File.find({ author: req.user.id });

  for (const file of files) {
    const path = `./public/usersFiles/${file.uuid}.encrypted`;
    if (fsDefault.existsSync(path)) await fs.unlink(path);
    await file.remove();
  }

  const messages = await Message.find({ author: req.user.id });

  for (const message of messages) await message.remove();

  res.sendStatus(200);
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
  handleNukeAllMessages,
};
