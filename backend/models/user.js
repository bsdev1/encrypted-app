const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true, select: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, doc) {
    doc.id = doc._id;
    delete doc._id;
  }
});

module.exports = model('User', userSchema);