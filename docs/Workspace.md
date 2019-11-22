# Workspace

## Introduction

The Workspace component is where the action happens.

## Data from withPopulatedRoom

The data for Workspaces (and Replayer and Stats) is injected into the component via the withPopulatedRoom higher order component (HOC). `./client/src/Containers/Data`

## Temporary Workspace

## Workspace membership

Membership in a room is managed by the local state of the Workspace component except when the Workspace is a temporary room (in which case membership is managed by the local state of TempWorkspace).

### Regular Workspace membership flow

`<Workspace /> -- ./client/src/Containers/Workspace`

1. `constructor(props)` initialize state.currentMembers to populatedRoom.currentMembers
1. `componentDidMount()` call this.iniatilizeListeners
1. `initializeListeners()`

   3.1. emit join

   ```javascript
   socket.emit('JOIN', sendData, ({room}, err) => {
    this.setState({currentMembers: room.currentMembers})
    this.addToLog(message)
   }
   ```

   3.2. initialize join listener

   ```javascript
   socket.on('USER_JOINED', data => {
     this.setState({
       currentMembers: data.currentMembers,
     });
     this.addToLog(data.message);
   });
   ```

   3.3 initialize leave listener

   ```javascript
   socket.on('USER_LEFT', data => {
     let { controlledBy } = this.state;
     if (data.releasedControl) {
       controlledBy = null;
     }
     this.setState({ controlledBy, currentMembers: data.currentMembers });
     this.addToLog(data.message);
   });
   ```

### TempWorkspace membership flow

`<TempWorkspace />`

1. `render()` -- render a modal asking for temporary username (and room type if firstEntry).
2. `componentDidMount()`

   2.1. initialize 'USER_JOINED_TEMP' listener to setState of currentMembers, members, and lastMessage, when users join.

3. When the user clicks the room type or "Join" `joinRoom(roomType)`

   3.1 Emit join temp message

   ```javascript
       socket.emit('JOIN_TEMP', sendData, (res, err) => {
   ```

   3.2 Set state of user, currentMembers, members, and lastMessage

4. Render workspace after the user is set in local state.

```jsx
{
  user ? (
    <Workspace
      {...this.props}
      temp
      tempCurrentMembers={currentMembers}
      tempMembers={members}
      lastMessage={lastMessage}
      firstEntry={firstEntry}
      user={user}
      save={!saved ? this.saveWorkspace : null}
    />
  ) : null;
}
```

`<Workspace> -- ./client/src/Containers/Workspace`

1. `render()` -- if tempCurrentMembers and tempMembers exist, use those values
   insteado of populatedRoom.members and this.state.currentMembers

## Saving a Temporary Workspace
