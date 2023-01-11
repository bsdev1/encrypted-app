const {
  handleGetMessages,
  handleGetFiles,
  handleEditMessage,
  handleRemoveMessage,
} = require('../handlers/messages');
const { ensureAuthenticated } = require('../utils/auth');
const express = require('express');
const router = express.Router();

router.get('/messages', ensureAuthenticated, handleGetMessages);
router.get('/getFiles/:message', ensureAuthenticated, handleGetFiles);
router.patch('/editMessage/:message', ensureAuthenticated, handleEditMessage);
router.delete(
  '/removeMessage/:message',
  ensureAuthenticated,
  handleRemoveMessage
);

module.exports = router;
