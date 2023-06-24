const { Schema, model } = require('mongoose');

const fileUploadSchema = new Schema({
  fileUUID: { type: String, required: true },
  finished: { type: Boolean, default: false },
  author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = model('FileUpload', fileUploadSchema);
