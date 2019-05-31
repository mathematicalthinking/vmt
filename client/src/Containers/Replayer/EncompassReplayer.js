import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classes from './EncompassReplayer.css';
import SharedReplayer from './SharedReplayer';

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
    return window.vmtRooms[roomId] || null;
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
            room={room}
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
