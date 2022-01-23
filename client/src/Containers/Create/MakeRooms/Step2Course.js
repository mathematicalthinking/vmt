import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput, Button, ToggleGroup } from 'Components';
import classes from './makeRooms.css';

class Step1Course extends Component {
  render() {
    const {
      // participantList,
      assignmentMatrix,
      isRandom,
      error,
      submit,
      setNumber,
      participantsPerRoom,
      roomNum,
      setRoomNumber,
      setRandom,
      setManual,
      shuffleParticipants,
    } = this.props;
    return (
      <div className={classes.Container}>
        <h2 className={classes.Title}>Assign To Rooms</h2>
        <ToggleGroup
          buttons={['Manual', 'Random']}
          value={isRandom ? 'Random' : 'Manual'}
          onChange={isRandom ? setManual : setRandom}
        />
        {isRandom ? (
          <div className={classes.SubContainer}>
            <div className={classes.Error}>{error || ''}</div>
            <TextInput
              light
              label="Number of participants per room"
              type="number"
              change={setNumber}
              onKeyDown={setNumber}
              value={String(participantsPerRoom)} // TextInput expects values to be text (i.e., strings)
              name="participants"
            />{' '}
            <div> {assignmentMatrix}</div>
          </div>
        ) : (
          // manual assignment display
          <div className={classes.SubContainer}>
            <div className={classes.Error}>{error || ''}</div>
            <TextInput
              light
              label="Number of rooms to create"
              type="number"
              change={(event) => setRoomNumber(event.target.value)}
              value={String(roomNum)}
              name="rooms"
            />
            {/* <div className={classes.ParticipantList}>{participantList}</div> */}
            <div> {assignmentMatrix}</div>
          </div>
        )}
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
          <Button m={5} click={submit} data-testid="assign-rooms">
            assign
          </Button>
        </div>
      </div>
    );
  }
}

Step1Course.propTypes = {
  assignmentMatrix: PropTypes.element.isRequired,
  participantsPerRoom: PropTypes.number,
  roomNum: PropTypes.number,
  isRandom: PropTypes.bool,
  setNumber: PropTypes.func.isRequired,
  setRoomNumber: PropTypes.func,
  setRandom: PropTypes.func,
  setManual: PropTypes.func,
  shuffleParticipants: PropTypes.func,
  error: PropTypes.string,
  submit: PropTypes.func.isRequired,
};

Step1Course.defaultProps = {
  error: null,
  isRandom: false,
  participantsPerRoom: 0,
  roomNum: 1,
  setRoomNumber: () => {},
  setRandom: () => {},
  setManual: () => {},
  shuffleParticipants: () => {},
};

export default Step1Course;
