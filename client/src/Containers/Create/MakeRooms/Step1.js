import React, { Component } from "react";
import classes from "./makeRooms.css";
import { Aux, Button } from "../../../Components";
class Step1 extends Component {
  render() {
    let { activity, participantList, nextStep } = this.props;
    return (
      <Aux>
        <div className={classes.Container}>
          <h2 className={classes.Title}>Assign To Rooms</h2>
          <div className={classes.SubContainer}>
            <div className={classes.ParticipantList}>{participantList}</div>
          </div>
          <div className={classes.Button}>
            <Button m={5} click={nextStep} data-testid="next-step-assign">
              Next
            </Button>
          </div>
        </div>
      </Aux>
    );
  }
}

export default Step1;
