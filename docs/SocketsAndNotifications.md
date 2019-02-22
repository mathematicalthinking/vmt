# Notifications and WebSockets

This section details the setup of socket.io on both the front and back ends and describes how notifications are handled over the socket.

## Socket setup

### Server

The socket connection is initialized in `./bin` along with other server configuration. The init function (imported from `./socketinit.js`) takes the server instance as its only argument. We moved this initialization into a seperate file so that we can share the `io` object around the application and emit/recieve events from any file. Immediately after initialization of the socket connection we initialize the socket listeners imported from './sockets.js` @todo rename to socketListeners.js

For a full list of socket events see

### Client

On the client side we follow a similar approach to make the `socket` object accessible from anywhere in the app. In `./src/utils/sockets.js` For the initilization we just determine the url of the server based on `NODE_ENV` and then export the result of `io.connect(URL)` i.e. the socket object.

In App.js you'll see that the entire App is wrapped in `<SocketProvider>` While this isn't a true higher order component (because it does not inject props into its children) we need a place to communicate with the redux store when notifications come in or our socket status changes. We could technically do this outside of the React component tree, but for consistency I think it makes sense to follow the update pattern used in the rest of the app.

### Keeping `socket.id` and `user._id` in sync

When a user arrives at VMT a socket connection is immediately established (in `src/utils/sockets.js`). In `src/components/HOC/SocketProvider` we check if the user is logged in, and if they are, we emit a "SYNC_SOCKET" event and establish our socket listeners. "SYNC_SOCKET" takes the userId and the socketId and sends them to the backend where the socketId can be stored on the user model. Every time the socket connects, reconnects, or the user logs in, we emit "SYNC_SOCKET". Thus, if a notification comes in, we can check the user it is for, and if they have a socketId, we emit the notification to that socketId so they receive the notification immediately.

## Notifications

Notifications are used to alert users about membership in rooms in courses. For example, when user A requests access to a room. The owner of that room (user B) will get a notification describing that request. If they grant access to user A they will get a notification saying they've been add to the room.

### Using socket.id to send notifications
