/* eslint-disable no-unused-vars */
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
    currentMembers: [],
    members: [],
    lastMessage: null,
    errorMessage: '',
    firstEntry: true,
    saving: false,
    saved: false,
  };

  initialCurrentMembers = [];

  componentDidMount() {
    const { populatedRoom } = this.props;
    // If there is no room by this id ins the user's store, then they're not the first to join
    // The user creating this room will it have in their store. A user who just drops the link in their url bar will not have it in the store
    if (
      populatedRoom.currentMembers &&
      populatedRoom.currentMembers.length > 0
    ) {
      this.setState({ firstEntry: false });
    }

    socket.on('USER_JOINED_TEMP', (data) => {
      const { currentMembers, members } = data;
      this.setState({ currentMembers, members, lastMessage: data.message });
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
  }

  setName = (event) => {
    this.setState({ tempUsername: event.target.value, errorMessage: '' });
  };

  joinRoom = (graphType) => {
    const { loggedIn, username, userId, populatedRoom } = this.props;
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

    const { _id } = populatedRoom;
    const sendData = {
      _id: generateMongoId(),
      userId, // this will be undefined if they're not logged in
      firstEntry,
      username: roomUsername,
      tempRoom: true,
      roomName: `temporary room ...${_id.slice(_id.length - 5, _id.length)}`,
      roomId: _id,
      color: COLOR_MAP[populatedRoom.members.length || 0],
      tabId: populatedRoom.tabs[0]._id,
      roomType: graphType, // this wil be undefined if its not the first user in the room
    };
    const updatedTabs = [...populatedRoom.tabs];
    if (graphType === 'desmos' && firstEntry) {
      updatedTabs[0].tabType = 'desmos';
    }
    // this.setState({enteredRoom: true, graph: graphType})
    return socket.emit('JOIN_TEMP', sendData, (res, err) => {
      if (err) {
        console.log('error ', err); // HOW SHOULD WE HANDLE THIS
      }
      res.user.connected = socket.connected;
      // eslint-disable-next-line no-console
      this.setState({
        user: res.user,
        currentMembers: res.room.currentMembers,
        members: res.room.members,
        lastMessage: res.message,
      });
    });
  };

  saveWorkspace = () => {
    const { connectAddUserRooms, loggedIn, match } = this.props;
    if (loggedIn) connectAddUserRooms(match.params.id); // this is going to re-render the compnent ?? BAD
    this.setState({ saving: true });
  };

  goBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const { loggedIn, populatedRoom } = this.props;
    const {
      user,
      saving,
      firstEntry,
      saved,
      errorMessage,
      currentMembers,
      members,
      lastMessage,
      tempUsername,
    } = this.state;
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
              room={populatedRoom._id}
              closeModal={() => this.setState({ saving: false })}
            />
          </Modal>
        ) : null}
        {user ? (
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
        ) : null}
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
              disabled={!loggedIn && !tempUsername}
            >
              Desmos
            </Button>
            <Button
              data-testid="temp-geogebra"
              m={5}
              click={() => this.joinRoom('geogebra')}
              disabled={!loggedIn && !tempUsername}
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
  // connectPopulateRoom: PropTypes.func.isRequired,
  connectRemovedRoom: PropTypes.func.isRequired,
  connectUpdateRoom: PropTypes.func.isRequired,
  connectUpdatedRoom: PropTypes.func.isRequired,
  connectAddUserRooms: PropTypes.func.isRequired,
  connectAddToLog: PropTypes.func.isRequired,
};

const mapStateToProps = (store, ownProps) => ({
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
