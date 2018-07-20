const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User')
const RoomTemplate = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String},
  creator: {type: ObjectId, ref: 'User'},
},{timestamps: true});

Room.pre('save', function (next) {
  // setting up a way for our post save method to see if this 'save' was the first
  this.wasNew = this.isNew;
  next();
});

Room.post('save', function(doc) { // intentionally not using arrow functions
  // so 'this' refers to the model
  User.findById(doc.creator, (err, res) => {
    if (err) {
      return console.log(err)
    }
    // if we're creating this Room (rather than updating)
    // add it to the users templates
    if (this.wasNew) {
      res.roomTemplates.push(doc._id)
      res.save()
    }
  })
})

module.exports = mongoose.model('RoomTemplate', RoomTemplate);
