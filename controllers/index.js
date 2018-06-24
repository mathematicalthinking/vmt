const message = require('./messageController');
const user = require('./userController');

// es6 shorthand for creating an object with property names that match the value
// equivalent to
// module.exports = {
//   chat: chat,
//   user: user,
//   location: location
// }
module.exports = {
  message,
  user,
}
