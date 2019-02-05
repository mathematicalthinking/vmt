import React, { Component } from "react";
import classes from "./makeRooms.css";
import { RadioBtn, TextInput, Button } from "../../../Components";
class Step1Course extends Component {
  render() {
    let {
      participantList,
      assignRandom,
      setRandom,
      submit,
      setManual,
      error
    } = this.props;
    console.log(setManual);
    return (
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
          <Button m={5} click={this.props.submit} data-testid="assign-rooms">
            assign
          </Button>
        </div>
      </div>
    );
  }
}

export default Step1Course;
