const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
  content: { type: String, required: true },
  edited: { type: Boolean, default: false },
  filesCount: { type: Number, default: 0 },
  fileDescriptions: Array,
  author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

messageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, doc) {
    delete doc._id;
  }
});

module.exports = model('Message', messageSchema);