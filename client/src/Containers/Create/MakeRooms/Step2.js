import React, { Component } from "react";
import classes from "./makeRooms.css";
import DueDate from "../DueDate";
import { Button } from "../../../Components";

class Step1 extends Component {
  render() {
    return (
      <div className={classes.SubContainer}>
        <DueDate dueDate={this.state.dueDate} selectDate={this.setDueDate} />
        <Button m={5} click={this.submit} data-testid="assign-rooms">
          Assign
        </Button>
      </div>
    );
  }
}

export default Step1;
