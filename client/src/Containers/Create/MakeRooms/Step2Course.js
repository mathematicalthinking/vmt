import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './makeRooms.css';
import { RadioBtn, TextInput, Button } from '../../../Components';

class Step1Course extends Component {
  render() {
    const {
      participantList,
      isRandom,
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
            checked={isRandom}
            check={setRandom}
            defaultChecked
          >
            Assign Randomly
          </RadioBtn>
          <RadioBtn
            data-testid="assign-manually"
            name="manual"
            checked={!isRandom}
            defaultChecked={false}
            check={setManual}
          >
            Assign Manually
          </RadioBtn>
        </div>
        {isRandom ? (
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
  participantList: PropTypes.element.isRequired,
  isRandom: PropTypes.bool,
  setRandom: PropTypes.func.isRequired,
  setManual: PropTypes.func.isRequired,
  error: PropTypes.string,
  submit: PropTypes.func.isRequired,
};

Step1Course.defaultProps = {
  error: null,
  isRandom: false,
};

export default Step1Course;
