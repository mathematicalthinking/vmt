import React, { Component } from "react";
import ReactDOM from "react-dom";
import API from "../../utils/apiRequests";
import Replayer from "./Replayer";

class EncompassReplayer extends Component {
  state = {
    room: null
  };

  componentDidMount() {
    // MAKE API TO GET ROOM
    // Build a log
    API.getById("rooms", "5c9b8fcbd0b60d458861808f", false, true).then(res => {
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
    });
  }

  render() {
    if (this.state.room) {
      return <Replayer room={this.state.room} encompass />;
    } else {
      return <div>Fetching room</div>;
    }
  }
}

ReactDOM.render(<EncompassReplayer />, document.getElementById("root"));
