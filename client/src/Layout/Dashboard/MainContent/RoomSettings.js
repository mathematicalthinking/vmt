import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './roomSettings.css';
import { RadioBtn } from '../../../Components';

class RoomSettings extends Component {
  toggleCreateTabs = () => {
    const { roomId, settings, updateRoom } = this.props;
    const updatedSettings = { ...settings };
    updatedSettings.participantsCanCreateTabs = !settings.participantsCanCreateTabs;
    updateRoom(roomId, { settings: updatedSettings });
  };

  togglePerspective = () => {
    const { roomId, settings, updateRoom } = this.props;

    const updatedSettings = { ...settings };
    updatedSettings.participantsCanChangePerspective = !settings.participantsCanChangePerspective;
    updateRoom(roomId, { settings: updatedSettings });
  };
  render() {
    const { settings, owner } = this.props;
    console.log('Room settings: ', owner);
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
        {/* Ggb perspective option set to disabled for now */}
        {/* <h2 className={classes.Heading}>
          Participants can change the perspective (GeoGebra)
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
        </RadioBtn> */}
        {/* Control specificity not yet added TODO */}
        {/* <h2 className={classes.Heading}>Control Specificity</h2>
        <RadioBtn name="yes" checked={settings.controlByRoom === false}>
          Room
        </RadioBtn>
        <RadioBtn name="No" checked={settings.controlByTab === true}>
          Tab
        </RadioBtn> */}
      </div>
    ) : (
      <div>
        <h2 className={classes.Heading}>Participants can create new Tabs</h2>
        <div>{settings.participantsCanCreateTabs ? 'Yes' : 'No'}</div>
        {/* <h2 className={classes.Heading}>
          Participants can change the Perspective (GeoGebra)
        </h2>
        <div>{settings.participantsCanChangePerspective ? 'Yes' : 'No'}</div> */}
      </div>
    );
  }
}

RoomSettings.propTypes = {
  roomId: PropTypes.string.isRequired,
  settings: PropTypes.shape({}).isRequired,
  owner: PropTypes.bool.isRequired,
  updateRoom: PropTypes.func.isRequired,
};
export default RoomSettings;
