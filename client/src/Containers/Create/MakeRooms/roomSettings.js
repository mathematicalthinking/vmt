import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'Components';
import { ROOM_SETTINGS } from 'constants.js';
import Select from 'react-select';
import classes from './makeRooms.css';

const INITIAL_ROOM_SETTINGS = Object.keys(ROOM_SETTINGS).map((setting) => {
  return { [setting]: false };
});

const inializeRoomSettings = (selectedAssignment = {}) => {
  const roomSettings = [];
  Object.keys(ROOM_SETTINGS).forEach((setting) => {
    roomSettings.push({ [setting]: selectedAssignment[setting] || false });
  });

  const roomSettingsOptions = Object.keys(ROOM_SETTINGS).map((setting) => {
    return {
      value: setting,
      label: ROOM_SETTINGS[setting],
    };
  });
  return [roomSettings, roomSettingsOptions];
};

const handleRoomSettingsChange = (
  roomSettings = { ...INITIAL_ROOM_SETTINGS },
  settingToChange
) => {
  const newSettings = { ...roomSettings };
  newSettings[settingToChange] = !newSettings[settingToChange] || false;
  console.groupCollapsed('{ newSettings, roomSettings, settingToChange }');
  console.log({ newSettings, roomSettings, settingToChange });
  console.groupEnd();
  return newSettings;
};

// need a way to display the settings react-select component and to handle when the user changes the settings

const RoomSettingsDropdown = (selectedAssignment = {}) => {
  const [roomSettings, roomSettingsOptions] = inializeRoomSettings(
    selectedAssignment
  );
  console.groupCollapsed('roomSettingsOptions');
  console.log(roomSettingsOptions);
  console.log('roomSettings');
  console.log(roomSettings);
  console.groupEnd();
  return (
    <Select
      isMulti
      isSearchable={false}
      hideSelectedOptions={false}
      closeMenuOnSelect={false}
      controlShouldRenderValue={false}
      onChange={(event) => {
        console.log('onChange: event');
        console.log(event);
        handleRoomSettingsChange(roomSettingsOptions);
      }}
      defaultValue={{ label: 'Change settings for all rooms', value: '' }}
      value={roomSettings}
      options={roomSettingsOptions}
      formatOptionLabel={({ label, value }) => {
        console.log('formatOptionLabel: { label, value }');
        console.log({ label, value });
        console.groupEnd();
        if (value)
          return (
            <div className={classes.RoomSettingsOption}>
              <Checkbox
                checked={((e) => {
                  return roomSettings[value] || false;
                })()}
                change={(e) => {
                  console.log('change: e');
                  console.log(e);
                  handleRoomSettingsChange(roomSettings, value);
                }}
                dataId={value}
              >
                {label}
              </Checkbox>
            </div>
          );
        return <div className={classes.RoomSettingsOption}>{label}</div>;
      }}
      name="roomSettings"
      className="basic-multi-select"
      classNamePrefix="select"
    />
  );
};

RoomSettingsDropdown.propTypes = {
  roomSettings: PropTypes.shape({}),
};

RoomSettingsDropdown.defaultProps = {
  roomSettings: {},
};

export default RoomSettingsDropdown;
