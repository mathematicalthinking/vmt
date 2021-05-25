import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './makeRooms.css';
import { TextInput, Button } from '../../../Components';

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
    } = this.props;
    return (
      <div className={classes.Container}>
        <h2 className={classes.Title}>Assign To Rooms</h2>
        {isRandom ? (
          <div className={classes.SubContainer}>
            <div className={classes.Error}>{error || ''}</div>
            <TextInput
              light
              label="Number of participants per room"
              type="number"
              change={setNumber}
              value={participantsPerRoom}
              name="participants"
            />
          </div>
        ) : (
          // manual assignment display
          <div className={classes.SubContainer}>
            <div className={classes.Error}>{error || ''}</div>
            <TextInput
              light
              label="Number of rooms to create"
              type="number"
              change={setRoomNumber}
              value={roomNum}
              name="rooms"
            />
            {/* <div className={classes.ParticipantList}>{participantList}</div> */}
            <div> {assignmentMatrix}</div>
          </div>
        )}
        <div className={classes.Button}>
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
  error: PropTypes.string,
  submit: PropTypes.func.isRequired,
};

Step1Course.defaultProps = {
  error: null,
  isRandom: false,
  participantsPerRoom: 0,
  roomNum: 1,
  setRoomNumber: () => {},
};

export default Step1Course;
