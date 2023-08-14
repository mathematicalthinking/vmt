import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'Components';
import { Room } from 'Model';
import Select, { components } from 'react-select';
import classes from './roomSettingsDropdown.css';

const RoomSettingsDropdown = ({ initialSettings, onChange }) => {
  const [roomSettingsOptions, setRoomSettingsOptions] = useState([]);

  const handleRoomSettingsChange = (option) => {
    setRoomSettingsOptions((prevRoomSettingsOptions) =>
      // find the matching option.setting in prevRoomSettingsOptions and toggle its value
      prevRoomSettingsOptions.map((opt) => {
        if (opt.setting === option.setting) {
          return { ...opt, value: !opt.value };
        }
        return opt;
      })
    );
    onChange({ ...option, value: !option.value });
  };

  useEffect(() => {
    const source = initialSettings || Room.getDefaultRoomSettings();
    const defaultRoomSettingsOptions = Object.keys(source).map((setting) => {
      return {
        value: source[setting],
        label: Room.settings[setting].label,
        setting,
      };
    });

    // change roomSettings Option to an object in the form of { setting: value }
    const roomSettings = defaultRoomSettingsOptions.reduce((acc, curr) => {
      acc[curr.setting] = curr.value;
      return acc;
    }, {});
    onChange(roomSettings);
    setRoomSettingsOptions(defaultRoomSettingsOptions);
  }, [initialSettings]);

  return (
    <Select
      isMulti
      isSearchable={false}
      hideSelectedOptions={false}
      closeMenuOnSelect={false}
      isClearable={false}
      controlShouldRenderValue={false}
      placeholder="Update room settings"
      value={roomSettingsOptions.filter((option) => option.value)}
      options={roomSettingsOptions}
      onChange={(_oldOption, newOption) =>
        handleRoomSettingsChange(newOption.option)
      }
      components={{ Option }}
      name="roomSettings"
      className="basic-multi-select"
      classNamePrefix="select"
    />
  );
};

RoomSettingsDropdown.propTypes = {
  initialSettings: PropTypes.shape({}),
  onChange: PropTypes.func.isRequired,
};

RoomSettingsDropdown.defaultProps = {
  initialSettings: {},
};

const Option = (props) => {
  const {
    children,
    data: { setting },
    isSelected,
  } = props;

  return (
    <components.Option {...props}>
      <div className={classes.RoomSettingsOption}>
        <Checkbox
          checked={isSelected}
          change={() => {}}
          dataId={`${setting}-checkbox`}
        >
          {children}
        </Checkbox>
      </div>
    </components.Option>
  );
};

Option.propTypes = {
  children: PropTypes.node,
  data: PropTypes.shape({
    setting: PropTypes.string,
  }),
  isSelected: PropTypes.bool,
};

Option.defaultProps = {
  children: null,
  data: {},
  isSelected: false,
};

export default RoomSettingsDropdown;
