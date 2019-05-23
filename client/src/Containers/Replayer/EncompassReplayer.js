import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classes from './EncompassReplayer.css';
import SharedReplayer from './SharedReplayer';

class EncompassReplayer extends Component {
  state = {
    room: null,
  };

  componentDidMount() {
    let currentUrl = window.location.hash;
    let roomId = this.getRoomIdFromUrl(currentUrl);
    this.setState({ room: this.getRoomFromWindow(roomId) });

    window.addEventListener('hashchange', this.setRoom, false);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.setRoom);
  }

  setRoom = event => {
    let newUrl = event.newURL;
    let roomId = this.getRoomIdFromUrl(newUrl);

    this.setState({ room: this.getRoomFromWindow(roomId) });
  };

  getRoomIdFromUrl = url => {
    if (typeof url !== 'string') {
      return null;
    }

    let target = 'vmtRoomId=';
    let targetIx = url.indexOf(target);
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
    if (this.state.room) {
      return (
        <div className={classes.EncompassReplayer}>
          <SharedReplayer
            room={this.state.room}
            updateEnc={this.updateEncompass}
            encompass
          />
        </div>
      );
    } else {
      return <div>Fetching room</div>;
    }
  }
}

let root = document.getElementById('root');

let destroyHandler = event => {
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
