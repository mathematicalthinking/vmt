import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './makeRooms.css';
import { RadioBtn, TextInput, Button } from '../../../Components';

class Step1Course extends Component {
  render() {
    const {
      participantList,
      assignRandom,
      setRandom,
      setManual,
      error,
      submit,
    } = this.props;
    return (
      <div className={classes.Container}>
        <h2 className={classes.Title}>Assign To Rooms</h2>
        <div className={classes.Radios}>
          <RadioBtn
            name="random"
            checked={assignRandom}
            check={setRandom}
            defaultChecked
          >
            Assign Randomly
          </RadioBtn>
          <RadioBtn
            data-testid="assign-manually"
            name="manual"
            checked={!assignRandom}
            defaultChecked={false}
            check={setManual}
          >
            Assign Manually
          </RadioBtn>
        </div>
        {assignRandom ? (
          <div className={classes.SubContainer}>
            <div className={classes.Error}>{error || ''}</div>
            <TextInput
              light
              label="Number of participants per room"
              type="number"
              change={this.setNumber}
            />
          </div>
        ) : (
          <div className={classes.SubContainer}>
            <div className={classes.ParticipantList}>{participantList}</div>
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
  participantList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  assignRandom: PropTypes.func.isRequired,
  setRandom: PropTypes.func.isRequired,
  setManual: PropTypes.func.isRequired,
  error: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
};

Step1Course.defaultPropTypes = {
  error: null,
};

export default Step1Course;
