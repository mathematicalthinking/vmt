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
  console.log('updating room: ', doc.room)
  Room.findById(doc.room, (err, res) => {
    console.log("error saving room: ",err)
    res.chat.push(doc._id)
    console.log(res)
    res.save()
    // .then(res => console.log('all good'))
    // .catch(err => console.log("ERR: ",err))
  })
})
module.exports = mongoose.model('Message', Message);
