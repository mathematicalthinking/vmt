import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Room } from 'Model';
import { RadioBtn } from 'Components';
import { socket } from 'utils';
import classes from './roomSettings.css';

export default function RoomSettings(props) {
  const { roomId, settings, owner, updateRoom } = props;

  const toggleSetting = (setting) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    updateRoom(roomId, {
      settings: newSettings,
    });
    socket.emit('SETTINGS_CHANGE', roomId, newSettings);
  };

  return (
    <div>
      {Object.keys(Room.settings).map((setting) => (
        <Fragment key={setting}>
          <h2 className={classes.Heading}>{Room.settings[setting].label}</h2>
          {owner ? (
            <Fragment>
              <RadioBtn
                name={setting}
                check={() => toggleSetting(setting)}
                checked={settings[setting]}
              >
                {Room.settings[setting].onLabel}
              </RadioBtn>
              <RadioBtn
                name={setting}
                check={() => toggleSetting(setting)}
                checked={!settings[setting]}
              >
                {Room.settings[setting].offLabel}
              </RadioBtn>
            </Fragment>
          ) : (
            <div>
              {settings[setting]
                ? Room.settings[setting].onLabel
                : Room.settings[setting].offLabel}
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

RoomSettings.propTypes = {
  roomId: PropTypes.string.isRequired,
  settings: PropTypes.shape({}).isRequired,
  owner: PropTypes.bool.isRequired,
  updateRoom: PropTypes.func.isRequired,
};
