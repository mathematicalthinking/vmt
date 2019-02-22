# Notifications and WebSockets

This section details the setup of socket.io on both the front and back ends and describes how notifications are handled over the socket.

## Socket setup

### Server

The socket connection is initialized in `./bin` along with other server configuration. The init function (imported from `./socketinit.js`) takes the server instance as its only argument. We moved this initialization into a seperate file so that we can share the `io` object around the application and emit/recieve events from any file. Immediately after initialization of the socket connection we initialize the socket listeners imported from './sockets.js` @todo rename to socketListeners.js

For a full list of socket events see

### Client

On the client side we follow a similar approach to make the `socket` object accessible from anywhere in the app. In `./src/utils/sockets.js` For the initilization we just determine the url of the server based on `NODE_ENV` and then export the result of `io.connect(URL)` i.e. the socket object.

WHERE SHOULD WE SET UP THE LISTENERS...THEY NEED TO BE ABLE TO DISPATCH ACTIONS TO THE REDUX STORE...We could do this from outside of the react app ?? however I think it makes more sense to do it from within for consistency if nothing else.

### Using socket.id to send notifications

### Keeping `socket.id` and `user._id` in sync

## Notifications

Notifications are used to alert users about membership in rooms in courses. For example, when user A requests access to a room. The owner of that room (user B) will get a notification describing that request. If they grant access to user A they will get a notification saying they've been add to the room.
