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

  togglePerspective = event => {
    let { roomId, settings } = this.props;

    let updatedSettings = { ...settings };
    updatedSettings.participantsCanChangePerspective = !settings.participantsCanChangePerspective;
    this.props.updateRoom(roomId, { settings: updatedSettings });
  };
  render() {
    let { settings, owner } = this.props;
    console.log("room settings ", settings);
    return owner ? (
      <div>
        <h2 className={classes.Heading}>Participants can create new Tabs</h2>
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
        <h2 className={classes.Heading}>
          Participants can change the perspective (Geogebra)
        </h2>
        <RadioBtn
          name="changePerspective"
          checked={settings.participantsCanChangePerspective === true}
          check={this.togglePerspective}
        >
          Yes
        </RadioBtn>
        <RadioBtn
          name="changePerspective"
          checked={settings.participantsCanChangePerspective === false}
          check={this.togglePerspective}
        >
          No
        </RadioBtn>
        <h2 className={classes.Heading}>Control Specificity</h2>
        <RadioBtn name="yes" checked={settings.controlByRoom === false}>
          Room
        </RadioBtn>
        <RadioBtn name="No" checked={settings.controlByTab === true}>
          Tab
        </RadioBtn>
      </div>
    ) : (
      <div>
        <h2 className={classes.Heading}>Participants can create new Tabs</h2>
        <div>{settings.participantsCanCreateTabs ? "Yes" : "No"}</div>
        <h2 className={classes.Heading}>
          Participants can change the Perspective (GeoGebra)
        </h2>
        <div>{settings.participantsCanChangePerspective ? "Yes" : "No"}</div>
      </div>
    );
  }
}

export default RoomSettings;
