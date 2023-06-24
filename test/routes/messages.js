const {
  handleGetMessages,
  handleGetFiles,
  handleEditMessage,
  handleRemoveMessage,
  handleNukeAllMessages,
} = require('../handlers/messages');
const { ensureAuthenticated } = require('../utils/auth');
const express = require('express');
const router = express.Router();

router.get('/messages', ensureAuthenticated, handleGetMessages);
router.delete('/messages/nuke', ensureAuthenticated, handleNukeAllMessages);
router.get('/getFiles/:message', ensureAuthenticated, handleGetFiles);
router.patch('/editMessage/:message', ensureAuthenticated, handleEditMessage);
router.delete(
  '/removeMessage/:message',
  ensureAuthenticated,
  handleRemoveMessage
);

module.exports = router;
