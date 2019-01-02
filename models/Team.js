const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Team = new mongoose.Schema({
  name: {type: String, required: true,},
  creator: {type: ObjectId, ref: 'User'},
  members: [{type: ObjectId, ref: 'User'}],
  isTrashed: { type: Boolean, default: false },
});

module.exports = mongoose.model('Team', Team);
