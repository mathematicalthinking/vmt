# Workspace

## Introduction

The Workspace component is where the action happens.

## Data from withPopulatedRoom

The data for Workspaces (and Replayer and Stats) is injected into the component via the withPopulatedRoom higher order component (HOC).

## Temporary Worksapce

## Workspace membership

Membership in a room is managed by the local state of the Workspace component except when the Workspace is a temporary room (in which case membership is managed by the local state of TempWorkspace).

### Regular Workspace membership flow

`<Workspace />`

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

1. `componentDidMount()`

   1.1. emit 'USER_JOINED_TEMP'
