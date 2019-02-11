import React, { Component } from "react";
import styles from "./roomSettings.css";

class RoomSettings extends Component {
  render() {
    return (
      <div>
        {this.props.owner ? (
          <div>Participants can create new Tabs</div>
        ) : (
          <div>NOT OWNER</div>
        )}
      </div>
    );
  }
}

export default RoomSettings;
