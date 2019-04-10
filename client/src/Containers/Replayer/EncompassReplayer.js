import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
import classes from "./EncompassReplayer.css";
import API from "../../utils/apiRequests";

// import WorkspaceLayout from "../../Layout/Workspace/Workspace";
// import ReplayerControls from "./ReplayerControls";
// import DesmosReplayer from "./DesmosReplayer";
// import GgbReplayer from "./GgbReplayer";
// import ChatReplayer from "./ChatReplayer";

// import CurrentMembers from "../../Components/CurrentMembers/CurrentMembers";
// import Loading from "../../Components/Loading/Loading";

// import Tabs from "../Workspace/Tabs";
// import Tools from "../Workspace/Tools/Tools";
// // import throttle from "lodash/throttle";
// import moment from "moment";
import SharedReplayer from "./SharedReplayer";

class EncompassReplayer extends Component {
  state = {
    roomId: null
  };

  componentDidMount() {
    window.addEventListener("hashchange", this.setRoomId, false);
    // MAKE API TO GET ROOM
    // Build a log
    // this.fetchRoom(this.state.roomId)
  }

  componentDidUpdate(prevState) {
    if (prevState.roomId !== this.state.roomId) {
      this.fetchRoom(this.state.roomId);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.setRoomId);
  }

  setRoomId = event => {
    this.setState({
      roomId: window.vmtRoomId
    });
  };

  fetchRoom = roomId => {
    API.getById("rooms", roomId, false, true, true)
      .then(res => {
        let room = res.data.result;
        let allEvents = [];
        room.tabs.forEach(tab => {
          allEvents = allEvents.concat(tab.events);
        });
        allEvents = allEvents
          .concat(room.chat)
          .sort((a, b) => a.timestamp - b.timestamp)
          .filter((entry, i, arr) => {
            if (arr[i - 1]) {
              if (entry.description) {
                return entry.description !== arr[i - 1].description;
              } else return true;
            }
            return true;
          });
        room.log = allEvents;
        this.setState({ room });
      })
      .catch(err => {
        console.log("error ger room", err);
      });
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
