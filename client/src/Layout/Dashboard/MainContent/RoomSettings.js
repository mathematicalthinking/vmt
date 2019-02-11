import React, { Component } from "react";
import classes from "./roomSettings.css";
import { RadioBtn } from "../../../Components/";
class RoomSettings extends Component {
  render() {
    let { settings, owner } = this.props;
    return (
      <div>
        {this.props.owner ? (
          <div>
            <h2>Participants can create new Tabs</h2>
            <RadioBtn
              name="yes"
              checked={settings.participantsCanCreateTabs === true}
            >
              Yes
            </RadioBtn>
            <RadioBtn
              name="No"
              checked={settings.participantsCanCreateTabs === false}
            >
              No
            </RadioBtn>
            <h2>Participants can change the perspective (Geogebra)</h2>
            <RadioBtn
              name="yes"
              checked={settings.participantsCanCreateTabs === true}
            >
              Yes
            </RadioBtn>
            <RadioBtn
              name="No"
              checked={settings.participantsCanCreateTabs === false}
            >
              No
            </RadioBtn>
            <h2>Control Specificity</h2>
            <RadioBtn
              name="yes"
              checked={settings.participantsCanCreateTabs === true}
            >
              Room
            </RadioBtn>
            <RadioBtn
              name="No"
              checked={settings.participantsCanCreateTabs === false}
            >
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
