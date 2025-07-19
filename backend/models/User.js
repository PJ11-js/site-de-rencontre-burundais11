const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  age: Number,
  lang: String,
  pic: String,
  latitude: Number,
  longitude: Number,
  likes: [String],
  matches: [String]
});
module.exports = mongoose.model('User', UserSchema);
