import React, { Component } from "react";
import classes from "./makeRooms.css";
import DueDate from "../DueDate";
import { Button } from "../../../Components";

class Step1 extends Component {
  render() {
    let { dueDate, setDueDate, nextStep } = this.props;
    return (
      <div className={classes.Container}>
        <DueDate dueDate={dueDate} selectDate={setDueDate} />
        <Button m={5} click={nextStep} data-testid="next-step-assign">
          Next
        </Button>
      </div>
    );
  }
}

export default Step1;
