import React from 'react';
import { TextInput, Button, Checkbox } from 'Components';
import classes from './makeRooms.css';

const AssignRooms = (props) => {
  const {
    initialAliasMode,
    initialDueDate,
    initialRoomName,
    participantsPerRoom,
    setParticipantsPerRoom,
    assignmentMatrix,
    onSubmit,
    onShuffle,
    onCancel,
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

  const handleParticipantsPerRoomChange = (event) => {
    const numberOfParticipants = parseInt(event.target.value.trim(), 10);
    setParticipantsPerRoom(numberOfParticipants);
  };

  const date = dueDate ? new Date(dueDate) : new Date();
  const dateStamp = `${date.getMonth() + 1}-${date.getDate()}`;

  return (
    <div className={classes.Container}>
      <div className={classes.SubContainer}>
        <TextInput
          light
          label="Participants per room"
          type="number"
          change={handleParticipantsPerRoomChange}
          onKeyDown={handleParticipantsPerRoomChange}
          value={String(participantsPerRoom)} // TextInput expects values to be text (i.e., strings)
          name="participants"
          width="185px"
        />

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
          title={`e.g. "${roomName} (${dateStamp}): 1"`}
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
            click={onCancel} // change the react-select back to defaulValues
            data-testid="assign-rooms"
            disabled={roomName === ''}
          >
            Cancel
          </Button>
          <Button m={5} click={onShuffle} data-testid="random-shuffle">
            Shuffle
          </Button>
          <Button
            m={5}
            click={() => onSubmit({ aliasMode, dueDate, roomName })}
            data-testid="assign-rooms"
            disabled={roomName === ''}
          >
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignRooms;
