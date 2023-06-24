const { Schema, model } = require('mongoose');
const fsDefault = require('fs');
const fs = require('fs/promises');

const fileSchema = new Schema({
  uuid: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  chunks: { type: Array, default: [] },
  message: { type: Schema.Types.ObjectId, required: true, ref: 'Message' },
  author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = model('File', fileSchema);
