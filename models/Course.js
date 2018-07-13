const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Course = new mongoose.Schema({
  courseName: {type: String},
  description: {type: String},
  creator: {type: ObjectId, ref: 'User'},
  nextRoom: {type: ObjectId, ref: 'Room'},
  rooms: [{type: ObjectId, ref: 'Room'}]
});

// Add this message to the room's chat
// @TODO for some reason I can't get $push to work
// ALso we're using the post method here instead of pre because we need
// the doc_id and because that is supplied by mongoose we have to do it after
Course.post('save', doc => {
  User.findById(doc.creator, (err, res) => {
    res.courses.push(doc._id)
    res.save()
    // .then(res => console.log('all good'))
    // .catch(err => console.log("ERR: ",err))
  })
})
module.exports = mongoose.model('Course', Course);
