import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, Button, Checkbox } from 'Components';
import classes from './makeRooms.css';

const EditRoomAssignments = (props) => {
  const {
    initialAliasMode,
    initialDueDate,
    initialRoomName,
    assignmentMatrix,
    onSubmit,
  } = props;

  const [aliasMode, setAliasMode] = React.useState(initialAliasMode);
  const [dueDate, setDueDate] = React.useState(initialDueDate);
  const [roomName, setRoomName] = React.useState(initialRoomName);

  const restoreNameClick = () => setRoomName(initialRoomName);
  const restoreNameKeyDown = (event) => {
    event.preventDefault();
    // 13 === "Enter" || 32 === "Space"
    if (event.keyCode === 13 || event.keyCode === 32) {
      setRoomName(initialRoomName);
    }
  };

  return (
    <div className={classes.Container}>
      <div className={classes.SubContainer}>
        <Checkbox
          light
          name="aliasUsernames"
          dataId="aliasUsernames"
          style={{ width: '175px' }}
          change={() => setAliasMode(!aliasMode)}
          checked={aliasMode || false}
        >
          Alias Usernames?
        </Checkbox>

        <TextInput
          light
          label="Due Date (Optional)"
          type="date"
          name="dueDate"
          width="175px"
          change={(e) => setDueDate(e.target.value)}
          value={dueDate}
        />

        {/* New room name input */}
        <TextInput
          light
          label="Prefix for room names (editable)"
          type="text"
          name="roomName"
          width="300px"
          change={(event) => setRoomName(event.target.value)}
          value={roomName}
          title={`e.g. "Intro to Geometry"`}
        />
        {initialRoomName !== roomName && (
          <i
            className={`fas fa-undo ${classes.RevertName}`}
            onClick={() => restoreNameClick()}
            onKeyDown={(event) => restoreNameKeyDown(event)}
            role="button"
            tabIndex={0}
          />
        )}
        {/* onKeyDown, role, & tabIndex are all included for eslint errs */}
      </div>

      {assignmentMatrix}

      <div className={classes.BottomButtons}>
        <div className={classes.Button}>
          <Button
            m={5}
            click={() =>
              onSubmit({ aliasMode, dueDate, roomName, initialRoomName })
            }
            data-testid="assign-rooms"
            disabled={roomName === ''}
          >
            Confirm Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

EditRoomAssignments.propTypes = {
  initialAliasMode: PropTypes.bool,
  initialDueDate: PropTypes.string,
  initialRoomName: PropTypes.string,
  assignmentMatrix: PropTypes.shape({}).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

EditRoomAssignments.defaultProps = {
  initialAliasMode: false,
  initialDueDate: '',
  initialRoomName: '',
};

export default EditRoomAssignments;
