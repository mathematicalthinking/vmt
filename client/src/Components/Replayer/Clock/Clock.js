import React, { PureComponent } from 'react';
import moment from 'moment';
import classes from './clock.css';

const msToTime = (duration) => {
  // let ms = parseInt((duration % 1000) / 100)
  let seconds = parseInt((duration / 1000) % 60, 10);
  let minutes = parseInt((duration / (1000 * 60)) % 60, 10);
  let hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  return hours + ":" + minutes + ":" + seconds
  // + ms + "0";
}

class Clock extends PureComponent {

  render() {
    const absTime = moment(this.props.startTime).add(this.props.absTimeElapsed, 'ms').format('MM/DD/YYYY h:mm:ss A')
    return (
      <div className={classes.Clocks}>
        <div className={classes.AbsClocks}>
          <div className={classes.AbsTime}>{msToTime(this.props.relTime)}</div>
          <div className={classes.AbsTime}>{msToTime(this.props.duration - this.props.relTime)}</div>
        </div>
        <div className={classes.RelTime}>{absTime}</div>

      </div>
    )
  }
}

export default Clock;
