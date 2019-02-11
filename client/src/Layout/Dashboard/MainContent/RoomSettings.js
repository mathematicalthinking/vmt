import React, { Component } from "react";
import classes from "./roomSettings.css";
import { RadioBtn } from "../../../Components/";
class RoomSettings extends Component {
  toggleCreateTabs = event => {
    let { roomId, settings } = this.props;
    console.log(event);
    console.log("setting toggled");
    let updatedSettings = { ...settings };
    updatedSettings.participantsCanCreateTabs = !settings.participantsCanCreateTabs;
    this.props.updateRoom(roomId, { settings: updatedSettings });
  };
  render() {
    let { settings, owner } = this.props;
    console.log("room settings ", settings);
    return (
      <div>
        {owner ? (
          <div>
            <h2>Participants can create new Tabs</h2>
            <RadioBtn
              name="createTabs"
              check={this.toggleCreateTabs}
              checked={settings.participantsCanCreateTabs === true}
            >
              Yes
            </RadioBtn>
            <RadioBtn
              name="createTabs"
              check={this.toggleCreateTabs}
              checked={settings.participantsCanCreateTabs === false}
            >
              No
            </RadioBtn>
            <h2>Participants can change the perspective (Geogebra)</h2>
            <RadioBtn
              name="yes"
              checked={settings.participantsCanChangePerspective === true}
            >
              Yes
            </RadioBtn>
            <RadioBtn
              name="No"
              checked={settings.participantsCanChangePerspective === false}
            >
              No
            </RadioBtn>
            <h2>Control Specificity</h2>
            <RadioBtn name="yes" checked={settings.controlByRoom === false}>
              Room
            </RadioBtn>
            <RadioBtn name="No" checked={settings.controlByTab === true}>
              Tab
            </RadioBtn>
          </div>
        ) : (
          <div>NOT OWNER</div>
        )}
      </div>
    );
  }
}

export default RoomSettings;
