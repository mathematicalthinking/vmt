import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  populateRoom,
  removedRoom,
  updatedRoom,
  updateRoom,
  addUserRooms,
  addToLog,
} from '../../store/actions';
import generateMongoId from '../../utils/createMongoId';
import Workspace from './Workspace';
import { Aux, TextInput, Modal, Button } from '../../Components';
import Signup from '../Signup';
import socket from '../../utils/sockets';
import COLOR_MAP from '../../utils/colorMap';
// import Replayer from ''
class TempWorkspace extends Component {
  state = {
    user: null,
    tempUsername: null,
    errorMessage: '',
    firstEntry: true,
    saving: false,
    saved: false,
  };

  componentDidMount() {
    const {
      connectPopulateRoom,
      connectUpdatedRoom,
      connectAddToLog,
      match,
      room,
    } = this.props;
    const { firstEntry } = this.state;
    // window.addEventListener("beforeunload", this.confirmUnload);
    connectPopulateRoom(match.params.id, {
      temp: true,
      events: !firstEntry,
    });
    // If there is no room by this id ins the user's store, then they're not the first to join
    // The user creating this room will it have in their store. A user who just drops the link in their url bar will not have it in the store
    if (!room || room.currentMembers.length > 0) {
      this.setState({ firstEntry: false });
    }
    socket.on('USER_JOINED_TEMP', data => {
      const { id } = match.params;
      const { currentMembers, members } = data;
      connectUpdatedRoom(id, { currentMembers, members });
      connectAddToLog(id, data.message);
    });
  }

  componentDidUpdate(prevProps) {
    const { loggedIn } = this.props;
    const { saving } = this.state;
    // An already signed in user has saved the workspace
    if (saving && !prevProps.loggedIn && loggedIn) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ saved: true, saving: false });
    }
    // The user has signed in from this page and saved the workspace
    if (!prevProps.loggedIn && loggedIn) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ saved: true });
    }
    // if (prevProps.room !== this.props.room) {
    //   console.log("ROOOOOM: ", this.props.room )
    // }
    // if (!prevProps.room && this.props.room) {
    // }
  }

  setName = event => {
    this.setState({ tempUsername: event.target.value, errorMessage: '' });
  };

  joinRoom = graphType => {
    const {
      loggedIn,
      username,
      match,
      userId,
      room,
      connectUpdatedRoom,
      connectAddToLog,
    } = this.props;
    const { tempUsername, firstEntry } = this.state;
    // Set username
    let roomUsername;
    if (loggedIn) {
      roomUsername = username;
    } else if (!tempUsername) {
      return this.setState({
        errorMessage: 'Please enter a username before joining',
      });
    } else {
      roomUsername = tempUsername;
    }

    const { id } = match.params;
    const sendData = {
      _id: generateMongoId(),
      userId, // this will be undefined if they're not logged in
      firstEntry,
      username: roomUsername,
      tempRoom: true,
      roomName: `temporary room ${id.slice(id.length - 5, id.length - 1)}...`,
      roomId: id,
      color: COLOR_MAP[room.members.length || 0],
      tabId: room.tabs[0]._id,
      roomType: graphType, // this wil be undefined if its not the first user in the room
    };
    const updatedTabs = [...room.tabs];
    if (graphType === 'desmos' && firstEntry) {
      updatedTabs[0].tabType = 'desmos';
    }
    // this.setState({enteredRoom: true, graph: graphType})
    return socket.emit('JOIN_TEMP', sendData, (res, err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('error ', err); // HOW SHOULD WE HANDLE THIS
      }
      connectUpdatedRoom(res.room._id, {
        currentMembers: res.room.currentMembers,
        members: room.members,
        tabs: updatedTabs,
      });
      connectAddToLog(res.room._id, res.message);
      // if (!this.state.firstEntry) res.room.chat.push(message);
      res.user.connected = socket.connected;
      this.setState({ user: res.user });
    });
  };

  saveWorkspace = () => {
    const {
      connectUpdatedRoom,
      connectAddUserRooms,
      loggedIn,
      match,
    } = this.props;
    const { user } = this.state;
    connectUpdatedRoom(match.params.id, {
      tempRoom: false,
      creator: user._id,
    });
    if (loggedIn) connectAddUserRooms(match.params.id);
    this.setState({ saving: true });
  };

  goBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const { loggedIn, room } = this.props;
    const { user, saving, firstEntry, saved, errorMessage } = this.state;
    return user ? (
      <Aux>
        {saving && !loggedIn ? (
          <Modal
            show={saving}
            closeModal={() => this.setState({ saving: false })}
          >
            <Signup
              temp
              user={user}
              room={room._id}
              closeModal={() => this.setState({ saving: false })}
            />
          </Modal>
        ) : null}
        <Workspace
          {...this.props}
          temp
          firstEntry={firstEntry}
          user={user}
          save={!saved ? this.saveWorkspace : null}
        />
      </Aux>
    ) : (
      <Modal show={!user} closeModal={this.goBack}>
        {!loggedIn ? (
          <Aux>
            <div>Enter a temporary username</div>
            <TextInput light change={this.setName} />
            <div>{errorMessage}</div>
          </Aux>
        ) : null}
        {firstEntry ? (
          <div>
            <p>Select a room type </p>
            <Button
              data-testid="temp-desmos"
              m={5}
              click={() => this.joinRoom('desmos')}
            >
              Desmos
            </Button>
            <Button
              data-testid="temp-geogebra"
              m={5}
              click={() => this.joinRoom('geogebra')}
            >
              GeoGebra
            </Button>
          </div>
        ) : (
          <Button
            m={5}
            click={() => {
              this.joinRoom();
            }}
          >
            Join
          </Button>
        )}
      </Modal>
    );
  }
}

TempWorkspace.propTypes = {
  connectPopulateRoom: PropTypes.func.isRequired,
  connectRemovedRoom: PropTypes.func.isRequired,
  connectUpdateRoom: PropTypes.func.isRequired,
  connectUpdatedRoom: PropTypes.func.isRequired,
  connectAddUserRooms: PropTypes.func.isRequired,
  connectAddToLog: PropTypes.func.isRequired,
};

const mapStateToProps = (store, ownProps) => ({
  room: store.rooms.byId[ownProps.match.params.id],
  loggedIn: store.user.loggedIn,
  username: store.user.username,
  userId: store.user._id,
});

export default connect(
  mapStateToProps,
  {
    connectPopulateRoom: populateRoom,
    connectRemovedRoom: removedRoom,
    connectUpdateRoom: updateRoom,
    connectUpdatedRoom: updatedRoom,
    connectAddUserRooms: addUserRooms,
    connectAddToLog: addToLog,
  }
)(TempWorkspace);
