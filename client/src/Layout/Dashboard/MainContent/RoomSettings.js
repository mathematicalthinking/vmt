import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './roomSettings.css';
import { RadioBtn } from '../../../Components';

// @TODO Quite a lot of repeated code in this component. Suggest refactoring
// to eliminate the repeats and make things more scalable (i.e., new room settings)

class RoomSettings extends Component {
  // To speed up the UI, the state of the radio buttons are kept locally. When
  // they change, the redux store and DB are informed (via updateRoom())
  state = {
    createTabs: false,
    aliases: false,
  };

  componentDidMount() {
    const { settings } = this.props;
    this.setState({
      createTabs: settings.participantsCanCreateTabs,
      aliases: settings.displayAliasedUsernames,
    });
  }

  toggleCreateTabs = () => {
    const { roomId, settings, updateRoom } = this.props;
    const { createTabs } = this.state;
    updateRoom(roomId, {
      settings: { ...settings, participantsCanCreateTabs: !createTabs },
    });
    this.setState({ createTabs: !createTabs });
  };

  toggleAliasedUsernames = () => {
    const { roomId, settings, updateRoom } = this.props;
    const { aliases } = this.state;
    updateRoom(roomId, {
      settings: { ...settings, displayAliasedUsernames: !aliases },
    });
    this.setState({ aliases: !aliases });
  };

  // togglePerspective = () => {
  //   const { roomId, settings, updateRoom } = this.props;

  //   const updatedSettings = { ...settings };
  //   updatedSettings.participantsCanChangePerspective = !settings.participantsCanChangePerspective;
  //   updateRoom(roomId, { settings: updatedSettings });
  // };

  render() {
    const { owner } = this.props;
    const { createTabs, aliases } = this.state;
    return owner ? (
      <div>
        <h2 className={classes.Heading}>Participants can create new tabs</h2>
        <RadioBtn
          name="createTabs"
          check={this.toggleCreateTabs}
          checked={createTabs}
        >
          Yes
        </RadioBtn>
        <RadioBtn
          name="createTabs"
          check={this.toggleCreateTabs}
          checked={!createTabs}
        >
          No
        </RadioBtn>

        <h2 className={classes.Heading}>Use aliased usernames</h2>
        <RadioBtn
          name="aliasedUsernames"
          check={this.toggleAliasedUsernames}
          checked={aliases}
        >
          Yes
        </RadioBtn>
        <RadioBtn
          name="aliasedUsernames"
          check={this.toggleAliasedUsernames}
          checked={!aliases}
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
        <h2 className={classes.Heading}>Participants can create new tabs</h2>
        <div>{createTabs ? 'Yes' : 'No'}</div>

        <h2 className={classes.Heading}>Use aliased usernames</h2>
        <div>{aliases ? 'Yes' : 'No'}</div>

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
  settings: PropTypes.shape({
    participantsCanCreateTabs: PropTypes.bool,
    displayAliasedUsernames: PropTypes.bool,
    participantsCanChangePerspective: PropTypes.bool,
    controlByRoom: PropTypes.bool,
  }).isRequired,
  owner: PropTypes.bool.isRequired,
  updateRoom: PropTypes.func.isRequired,
};

export default RoomSettings;
