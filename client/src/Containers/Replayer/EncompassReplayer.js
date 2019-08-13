import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classes from './EncompassReplayer.css';
import SharedReplayer from './SharedReplayer';
import buildLog from '../../utils/buildLog';

class EncompassReplayer extends Component {
  state = {
    room: null,
  };

  componentDidMount() {
    const currentUrl = window.location.hash;
    const roomId = this.getRoomIdFromUrl(currentUrl);
    this.setState({ room: this.getRoomFromWindow(roomId) });

    window.addEventListener('hashchange', this.setRoom, false);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.setRoom);
  }

  setRoom = event => {
    const newUrl = event.newURL;
    const roomId = this.getRoomIdFromUrl(newUrl);

    this.setState({ room: this.getRoomFromWindow(roomId) });
  };

  getRoomIdFromUrl = url => {
    if (typeof url !== 'string') {
      return null;
    }

    const target = 'vmtRoomId=';
    const targetIx = url.indexOf(target);
    let roomId;

    if (targetIx !== -1) {
      roomId = url.slice(targetIx + target.length);
    }
    return roomId || null;
  };

  getRoomFromWindow = roomId => {
    if (!window.vmtRooms || !roomId) {
      return null;
    }
    const room = window.vmtRooms[roomId];
    if (!room) {
      return null;
    }
    room.log = buildLog(room.tabs, room.chat);
    return room;
  };

  updateEncompass = (messageType, replayerState, totalDuration) => {
    window.postMessage({
      messageType,
      vmtReplayerInfo: { ...replayerState, totalDuration },
    });
  };

  render() {
    const { room } = this.state;
    if (room) {
      return (
        <div className={classes.EncompassReplayer}>
          <SharedReplayer
            populatedRoom={room}
            updateEnc={this.updateEncompass}
            encompass
          />
        </div>
      );
    }
    return <div>Fetching room</div>;
  }
}

const root = document.getElementById('root');

const destroyHandler = event => {
  if (event.data.messageType === 'DESTROY_REPLAYER') {
    try {
      ReactDOM.unmountComponentAtNode(root);
      window.removeEventListener('message', destroyHandler);
    } catch (err) {
      // handle err
    }
  }
};

if (process.env.REACT_APP_ENCOMPASS) {
  window.addEventListener('message', destroyHandler);
}

ReactDOM.render(<EncompassReplayer />, root);
