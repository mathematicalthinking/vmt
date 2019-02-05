import React, { Component } from "react";
import classes from "./makeRooms.css";
import { Aux, RadioBtn, TextInput, Button } from "../../../Components";
class Step1Course extends Component {
  render() {
    let {
      participantList,
      assignRandom,
      setRandom,
      setManual,
      error
    } = this.props;
    console.log(setManual);
    return (
      <Aux>
        <div className={classes.Container}>
          <h2 className={classes.Title}>Assign To Rooms</h2>
          <div className={classes.Radios}>
            <RadioBtn
              name="random"
              checked={assignRandom}
              check={setRandom}
              defaultChecked={true}
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
              <div className={classes.Error}>{error || ""}</div>
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
            <Button
              m={5}
              click={this.props.nextStep}
              data-testid="next-step-assign"
            >
              Next
            </Button>
          </div>
        </div>
      </Aux>
    );
  }
}

export default Step1Course;
