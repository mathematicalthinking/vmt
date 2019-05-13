import React, { Component } from "react";
import ReactDOM from "react-dom";
import classes from "./EncompassReplayer.css";
import SharedReplayer from "./SharedReplayer";

class EncompassReplayer extends Component {
  state = {
    room: null
  };

  componentDidMount() {
    let currentUrl = window.location.hash;
    let roomId = this.getRoomIdFromUrl(currentUrl);
    this.setState({ room: this.getRoomFromWindow(roomId) });

    window.addEventListener("hashchange", this.setRoom, false);
  }

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.setRoom);
  }

  setRoom = event => {
    let newUrl = event.newURL;
    let roomId = this.getRoomIdFromUrl(newUrl);

    this.setState({ room: this.getRoomFromWindow(roomId) });
  };

  getRoomIdFromUrl = url => {
    if (typeof url !== "string") {
      return null;
    }

    let target = "vmtRoomId=";
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

  onLoad = (replayerState, totalDuration) => {
    window.postMessage({
      messageType: 'VMT_ON_REPLAYER_LOAD',
    });
    this.updateEncompass(replayerState, totalDuration);
  }

  updateEncompass = (replayerState, totalDuration) => {
    window.vmtReplayerInfo = {...replayerState, totalDuration };
  }

  render() {
    if (this.state.room) {
      return (
        <div className={classes.EncompassReplayer}>
          <SharedReplayer
            room={this.state.room}
            updateEnc={this.updateEncompass}
            onLoadEnc={this.onLoad}
            encompass
          />
        </div>
      );
    } else {
      return <div>Fetching room</div>;
    }
  }
}

ReactDOM.render(<EncompassReplayer />, document.getElementById("root"));
