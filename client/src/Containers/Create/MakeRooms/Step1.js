import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './makeRooms.css';
import DueDate from '../DueDate';
import { Button } from '../../../Components';

class Step1 extends Component {
  render() {
    const { dueDate, setDueDate, nextStep } = this.props;
    return (
      <div className={classes.Container}>
        <DueDate dueDate={dueDate} selectDate={setDueDate} />
        <div className={classes.ModalButton}>
          <Button m={5} click={nextStep} data-testid="next-step-assign">
            Next
          </Button>
        </div>
      </div>
    );
  }
}

Step1.propTypes = {
  dueDate: PropTypes.instanceOf(Date),
  setDueDate: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
};

Step1.defaultProps = {
  dueDate: null,
};
export default Step1;
