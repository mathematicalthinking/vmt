import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { Room } from 'Model';
import { RoomSettingsDropdown } from 'Components';
import classes from './selectAssignment.css';

const SelectAssignments = ({
  activity,
  course,
  userId,
  member,
  label,
  defaultOption,
  toolTip,
  AssignmentComponent,
  optionsGenerator,
  firstOption,
}) => {
  const [showAssignments, setShowAssignments] = React.useState(false);
  const [selectedAssignment, setSelectedAssignment] = React.useState(
    defaultOption
  );
  const [roomSettings, setRoomSettings] = React.useState({});

  useEffect(() => {
    // if selectedAssignment has settings and settings is not an empty object
    // then set roomSettings to selectedAssignment.settings
    // otherwise, set roomSettings to Room.defaultRoomSettings
    if (
      selectedAssignment &&
      selectedAssignment.settings &&
      Object.keys(selectedAssignment.settings).length
    ) {
      setRoomSettings(selectedAssignment.settings);
    } else {
      setRoomSettings(Room.getDefaultRoomSettings());
    }
  }, [selectedAssignment]);

  useEffect(() => {
    console.log('SelectAssignments roomSettings', roomSettings);
  }, [roomSettings]);

  const close = () => {
    setShowAssignments(false);
    setSelectedAssignment(defaultOption);
  };

  const handleSelection = (selectedOption) => {
    setShowAssignments(true);
    setSelectedAssignment(selectedOption);
  };

  const handleRoomSettingsChange = (option) => {
    setRoomSettings((prevRoomSettings) => {
      const newRoomSettings = { ...prevRoomSettings };
      newRoomSettings[option.setting] = option.value;
      return newRoomSettings;
    });
  };

  const previousAssignments = () => {
    const courseGroupings = course && course.groupings;
    const activityGroupings = activity && activity.groupings;
    const groupings = courseGroupings || activityGroupings;
    return groupings ? optionsGenerator(groupings, activity._id) : [];
  };

  const options = () => {
    const assignments = previousAssignments().map((assignment) => ({
      _id: assignment._id,
      settings: assignment.settings,
      dueDate: assignment.dueDate,
      label: `${assignment.name}: ${new Date(
        assignment.timestamp
      ).toLocaleString()}`,
      value: assignment.roomDrafts,
      roomName: assignment.name,
    }));
    return firstOption ? [firstOption].concat(assignments) : assignments;
  };

  return (
    <Fragment>
      <div className={classes.AssignContainer}>
        <div className={classes.NewAssignmentsContainer}>
          <label className={classes.AssignText} htmlFor="selection">
            {label}
          </label>
          <Select
            inputId="selection"
            className={classes.Select}
            isSearchable={false}
            options={options()}
            onChange={handleSelection}
            value={selectedAssignment}
          />
          <div className={classes.Instructions}>
            <i
              className={`far fa-question-circle fa-2x ${classes.QuestionMark}`}
            />
            <div className={classes.TooltipContent}>
              <p>{toolTip}</p>
            </div>
          </div>
        </div>
      </div>
      {showAssignments && (
        <AssignmentComponent
          activity={activity}
          course={course}
          userId={userId}
          close={close}
          participants={course ? course.members : [member]}
          selectedAssignment={selectedAssignment}
          roomSettings={roomSettings}
          roomSettingsComponent={
            <RoomSettingsDropdown
              onChange={handleRoomSettingsChange}
              initialSettings={roomSettings}
            />
          }
        />
      )}
    </Fragment>
  );
};

SelectAssignments.propTypes = {
  activity: PropTypes.shape({
    groupings: PropTypes.arrayOf(PropTypes.shape({})),
    _id: PropTypes.string,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  defaultOption: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  course: PropTypes.shape({
    members: PropTypes.arrayOf(PropTypes.shape({})),
    groupings: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  member: PropTypes.shape({}).isRequired,
  toolTip: PropTypes.string.isRequired,
  AssignmentComponent: PropTypes.func.isRequired,
  optionsGenerator: PropTypes.func.isRequired,
  firstOption: PropTypes.shape({}),
};

SelectAssignments.defaultProps = {
  course: null,
  firstOption: null,
};

export default SelectAssignments;
