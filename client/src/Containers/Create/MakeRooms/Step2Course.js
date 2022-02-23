import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput, Button, ToggleGroup } from 'Components';
import classes from './makeRooms.css';

class Step2Course extends Component {
  constructor(props) {
    super(props);
    const { roomName } = this.props;
    this.state = { defaultRoomName: roomName };
  }

  render() {
    const {
      assignmentMatrix,
      error,
      isRandom,
      participantsPerRoom,
      roomNum,
      roomName,
      setNumber,
      setRoomNumber,
      setRoomName,
      setRandom,
      setManual,
      shuffleParticipants,
      submit,
    } = this.props;

    const { defaultRoomName } = this.state;

    // show revert button if roomName differs from defaultRoomName
    // if the names differ, show the button
    const showRevertButton = defaultRoomName !== roomName;

    const date = assignmentMatrix.dueDate
      ? new Date(assignmentMatrix.dueDate)
      : new Date();
    const dateStamp = `${date.getMonth() + 1}-${date.getDate()}`;

    const restoreNameClick = () => {
      setRoomName(defaultRoomName);
    };

    const restoreNameKeyDown = (event) => {
      event.preventDefault();
      // 13 === "Enter" || 32 === "Space"
      if (event.keyCode === 13 || event.keyCode === 32) {
        setRoomName(defaultRoomName);
      }
    };

    return (
      <div className={classes.Container}>
        <h2 className={classes.Title}>Assign To Rooms</h2>
        <ToggleGroup
          buttons={['Random', 'Manual']}
          value={isRandom ? 'Random' : 'Manual'}
          onChange={isRandom ? setManual : setRandom}
        />
        <div className={classes.SubContainer}>
          {isRandom ? (
            <TextInput
              light
              label="Number of participants per room"
              type="number"
              change={setNumber}
              onKeyDown={setNumber}
              value={String(participantsPerRoom)} // TextInput expects values to be text (i.e., strings)
              name="participants"
              width="275px"
            />
          ) : (
            <TextInput
              light
              label="Number of rooms to create"
              type="number"
              change={(event) => setRoomNumber(event.target.value)}
              value={String(roomNum)}
              name="rooms"
              width="230px"
            />
          )}
          <div className={classes.Error}>{error || ''}</div>
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
        <div className={classes.Button}>
          {isRandom ? (
            <Button
              m={5}
              click={shuffleParticipants}
              data-testid="random-shuffle"
            >
              Shuffle
            </Button>
          ) : (
            ''
          )}
          <Button
            m={5}
            click={submit}
            data-testid="assign-rooms"
            disabled={roomName === ''}
          >
            assign
          </Button>
        </div>
      </div>
    );
  }
}

Step2Course.propTypes = {
  activity: PropTypes.shape({}).isRequired,
  assignmentMatrix: PropTypes.element.isRequired,
  error: PropTypes.string,
  isRandom: PropTypes.bool,
  participantsPerRoom: PropTypes.number,
  roomNum: PropTypes.number,
  roomName: PropTypes.string.isRequired,
  setNumber: PropTypes.func.isRequired,
  setRoomNumber: PropTypes.func,
  setRoomName: PropTypes.func.isRequired,
  setRandom: PropTypes.func,
  setManual: PropTypes.func,
  shuffleParticipants: PropTypes.func,
  submit: PropTypes.func.isRequired,
};

Step2Course.defaultProps = {
  error: null,
  isRandom: false,
  participantsPerRoom: 0,
  roomNum: 1,
  setRoomNumber: () => {},
  setRandom: () => {},
  setManual: () => {},
  shuffleParticipants: () => {},
};

export default Step2Course;
