const mongoose = require('mongoose');

// const { ObjectId } = mongoose.Schema.Types;

const Image = new mongoose.Schema({
  imageData: { type: String },
  isTrashed: { type: Boolean, default: false },
});
module.exports = mongoose.model('Image', Image);
