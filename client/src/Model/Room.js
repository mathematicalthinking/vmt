// These constants MUST be identical to the settings names enumerated in server>models>Rooms.js
const settingsConstants = {
  CREATE_TABS: 'participantsCanCreateTabs',
  ALIASED_USERNAMES: 'displayAliasedUsernames',
  TAB_BASED_CONTROL: 'independentTabControl',
};

const settings = {
  [settingsConstants.CREATE_TABS]: {
    label: 'Participants can create new tabs',
    onLabel: 'Yes',
    offLabel: 'No',
  },
  [settingsConstants.ALIASED_USERNAMES]: {
    label: 'Use aliased usernames',
    onLabel: 'Yes',
    offLabel: 'No',
  },
  [settingsConstants.TAB_BASED_CONTROL]: {
    label: 'Tabs have independent control',
    onLabel: 'Yes',
    offLabel: 'No',
  },
};

/**
 * Returns the boolean representing whether the room setting is on or off.
 * If the setting does not exist, returns false for now.
 * @param room - the room object
 * @param settingName - a string, one of the Room settings constants
 * @returns true or false
 */
const getRoomSetting = (room, settingName) => {
  // We should probably throw an error
  if (!Object.values(settingsConstants).includes(settingName)) return false;
  return room && room.settings && room.settings[settingName];
};

const Room = { settings, ...settingsConstants, getRoomSetting };
export default Room;
