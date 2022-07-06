import React, { useState, useEffect } from 'react';
import { TextInput, Button, Checkbox } from 'Components';
import classes from './makeRooms.css';

const EditRoomAssignments = (props) => {
  const {
    assignmentMatrix,
    selectedAssignment,
    aliasMode,
    setAliasMode,
    dueDate,
    setDueDate,
    roomName,
    setRoomName,
    submit,
    close
  } = props;

  const [defaultRoomName, setDefaultRoomName] = useState(
    selectedAssignment.label
  );
  // const [roomName, setRoomName] = useState(selectedAssignment.label);
  const [showRevertButton, setShowRevertButton] = useState(
    'Previous Assignments'
  );
  const [selectName, setSelectName] = useState(false);

  useEffect(() => {
    // check if revert to defaultRoomName button needs to be displayed
    setShowRevertButton(roomName !== defaultRoomName);
  }, [roomName]);

  const restoreNameClick = () => setRoomName(defaultRoomName);
  const restoreNameKeyDown = (event) => {
    const { defaultRoomName } = this.state;
    event.preventDefault();
    // 13 === "Enter" || 32 === "Space"
    if (event.keyCode === 13 || event.keyCode === 32) {
      setRoomName(defaultRoomName);
    }
  };

  const date = assignmentMatrix.dueDate
    ? new Date(assignmentMatrix.dueDate)
    : new Date();
  const dateStamp = `${date.getMonth() + 1}-${date.getDate()}`;

  return (
    <div className={classes.Container}>
      <div className={classes.SubContainer}>
        <Checkbox
          light
          name="aliasUsernames"
          dataId="aliasUsernames"
          style={{ width: '175px' }}
          change={() => setAliasMode(!aliasMode)}
          checked={aliasMode}
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
          title={`e.g. "${roomName} (${dateStamp}): 1"`}
        />
        {showRevertButton && (
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
          <Button m={5} click={close} data-testid="assign-rooms">
            Cancel
          </Button>
          <Button
            m={5}
            click={submit}
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

export default EditRoomAssignments;
