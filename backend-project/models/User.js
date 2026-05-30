const { Schema, model } = require('mongoose');
module.exports = model('User', new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
}));
