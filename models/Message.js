const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Room = require('./Room.js');
const Message = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  text: {type: String},
  room: {type: ObjectId, ref: 'Room'},
});

// Add this message to the room's chat
// @TODO for some reason I can't get $push to work
Message.post('save', doc => {
  Room.findById(doc.room, (err, res) => {
    res.chat.push(doc._id)
    res.save()
    // .then(res => console.log('all good'))
    // .catch(err => console.log("ERR: ",err))
  })
})
module.exports = mongoose.model('Message', Message);
