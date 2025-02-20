import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextInput, Button } from 'Components';
import { dateAndTime } from 'utils';
import classes from './makeRooms.css';

const AssignRooms = (props) => {
  const {
    initialDueDate,
    initialRoomName,
    participantsPerRoom,
    setParticipantsPerRoom,
    assignmentMatrix,
    onSubmit,
    onShuffle,
    onCancel,
  } = props;

  const [dueDate, setDueDate] = React.useState(initialDueDate);
  const [roomName, setRoomName] = React.useState(initialRoomName);

  useEffect(() => {
    setRoomName(initialRoomName);
  }, [initialRoomName]);

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

  // set min date selection taking timezone into consideration
  // https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd#comment58447831_29774197:~:text=1124-,Just,-leverage%20the%20built
  // let today = new Date();
  // const offset = today.getTimezoneOffset();
  // today = new Date(today.getTime() - offset * 60 * 1000);
  // [today] = today.toISOString().split('T');

  return (
    <div className={classes.Container}>
      <div className={classes.SubContainer}>
        {setParticipantsPerRoom && (
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
        )}
        <div className={classes.RoomNameInput}>
          {/* New room name input */}
          <TextInput
            light
            label="Prefix for room names (editable)"
            type="text"
            name="roomName"
            width="275px"
            change={(event) => setRoomName(event.target.value)}
            value={roomName}
            placeholder={roomName === '' ? 'Enter a room name prefix' : ''}
            title={roomName === '' ? `e.g. "Intro to Geometry"` : ''}
          />
          {initialRoomName !== roomName && (
            <i
              className={`fas fa-undo ${classes.RevertName}`}
              onClick={() => restoreNameClick()}
              onKeyDown={(event) => restoreNameKeyDown(event)}
              role="button"
              tabIndex={0}
              title="Use Default Room Name"
            />
          )}
        </div>
        <TextInput
          light
          label="Due Date (Optional)"
          type="date"
          name="dueDate"
          width="160px"
          minDate={dateAndTime.toDateString(Date.now())}
          change={(e) => {
            const datePicked = e.target.value;
            if (
              // compare only the dates (not the specific time)
              new Date(datePicked) <=
              new Date(dateAndTime.toDateString(Date.now()))
            )
              setDueDate('');
            else setDueDate(datePicked);
          }}
          value={dueDate}
          hover
        />
      </div>
      {assignmentMatrix}
      <div className={classes.BottomButtons}>
        <div className={classes.Button}>
          <Button
            m={5}
            click={onCancel} // change the react-select back to defaulValues
            data-testid="assign-rooms"
          >
            Cancel
          </Button>
          {onShuffle && (
            <Button m={5} click={onShuffle} data-testid="random-shuffle">
              Shuffle
            </Button>
          )}
          <Button
            m={5}
            click={() => onSubmit({ dueDate, roomName, initialRoomName })}
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

AssignRooms.propTypes = {
  initialDueDate: PropTypes.string,
  initialRoomName: PropTypes.string,
  participantsPerRoom: PropTypes.number,
  setParticipantsPerRoom: PropTypes.func,
  assignmentMatrix: PropTypes.shape({}).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onShuffle: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
};

AssignRooms.defaultProps = {
  initialDueDate: '',
  initialRoomName: '',
  setParticipantsPerRoom: null,
  onShuffle: null,
  participantsPerRoom: null,
};

export default AssignRooms;
