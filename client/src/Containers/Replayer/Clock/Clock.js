import React, { Component } from "react";
import moment from "moment";
import classes from "./clock.css";

const msToTime = duration => {
  // let ms = parseInt((duration % 1000) / 100)
  let seconds = parseInt((duration / 1000) % 60, 10);
  let minutes = parseInt((duration / (1000 * 60)) % 60, 10);
  let hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  if (hours === "00") {
    return minutes + ":" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
  // + ms + "0";
};

class Clock extends Component {
  shouldComponentUpdate(nextProps) {
    // Only update the clock when whole seconds have passed
    if (nextProps.relTime % 1000 === 0 || nextProps.changingIndex) {
      return true;
    }
    return false;
  }
  render() {
    console.log("CLOCK UPDATEd");
    // const absTime = moment(this.props.startTime)
    //   .add(this.props.absTimeElapsed, "ms")
    //   .format("MM/DD/YYYY h:mm:ss A");

    return (
      <div className={classes.ClockContainer}>
        <div className={classes.StartTime}>
          {msToTime(this.props.relTime)} /<br />
        </div>
        {/* <div className={classes.CenterTime}>{absTime}</div> */}
        <div className={classes.EndTime}>
          {" "}
          {msToTime(this.props.duration - this.props.relTime)}
        </div>
      </div>
    );
  }
}

export default Clock;
