const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User')
const RoomTemplate = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String},
  roomType: {type: String, default: 'geogebra'},
  creator: {type: ObjectId, ref: 'User'},
  isPublic: {type: Boolean, default: false},
},{timestamps: true});


RoomTemplate.post('save', doc => {
  User.findById(doc.creator, (err, res) => {
    if (err) {
      return console.log(err)
    }
    console.log(res)
    res.roomTemplates.push(doc._id)
    console.log(res)
    res.save()
    // .then(res => console.log('all good'))
    // .catch(err => console.log("ERR: ",err))
  })
})

module.exports = mongoose.model('RoomTemplate', RoomTemplate);
