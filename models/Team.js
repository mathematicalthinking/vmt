const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Team = new mongoose.Schema({
  name: {type: String},
  creator: {type: ObjectId, ref: 'User'},
  members: [{type: ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Team', Team);
