const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const Image = new mongoose.Schema({
  encoding: { type: String },
  mimetype: { type: String },
  destination:  { type: String }, //This should only be used if we aren't saving the data
  filename: { type: String }, //Not used yet
  imageData: { type: String },
  path: { type: String }, //Not used yet
  relativePath: { type: String }, //Not used yet
}, {timestamps: true})
module.exports = mongoose.model('Image', Image);