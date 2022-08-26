const { Schema, model } = require('mongoose');

const fileSchema = new Schema({
  uuid: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  iv: { type: Buffer, required: true },
  message: { type: Schema.Types.ObjectId, required: true, ref: 'Message' },
  author: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
});

fileSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, doc) {
    delete doc._id;
  }
});

module.exports = model('File', fileSchema);