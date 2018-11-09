const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const Image = new mongoose.Schema({
  imageData: { type: String },
})
module.exports = mongoose.model('Image', Image);