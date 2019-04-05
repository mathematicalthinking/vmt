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
    console.log("curl", currentUrl);
    console.log("window", window.vmtRooms);
    let roomId = this.getRoomIdFromUrl(currentUrl);
    let room = this.getRoomFromWindow(roomId);
    console.log("room cdm", room);
    this.setState({ room: this.getRoomFromWindow(roomId) });

    window.addEventListener("hashchange", this.setRoom, false);
  }

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.setRoom);
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("component did update", prevState);
    console.log("new state", this.state);
  }

  setRoom = event => {
    let newUrl = event.newURL;
    console.log("new url", newUrl);
    let roomId = this.getRoomIdFromUrl(newUrl);
    console.log("roomId", roomId);
    let room = this.getRoomFromWindow(roomId);
    console.log("room setroom", room);

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

  render() {
    if (this.state.room) {
      return (
        <div className={classes.EncompassReplayer}>
          <SharedReplayer room={this.state.room} encompass />
        </div>
      );
    } else {
      return <div>Fetching room</div>;
    }
  }
}

ReactDOM.render(<EncompassReplayer />, document.getElementById("root"));
