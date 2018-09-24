import React, { PureComponent } from 'react';
import classes from './replayer.css';
import moment from 'moment';

const msToTime = (duration) => {
  let seconds = parseInt((duration / 1000) % 60, 10);
  let minutes = parseInt((duration / (1000 * 60)) % 60, 10);
  let hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds ;
}

class Clock extends PureComponent {

  state = {
    absTime: 0,
    remainingTime: this.props.duration,
    relTime: this.props.startTime
  }


  componentDidUpdate(prevProps) {
    if (!prevProps.playing && this.props.playing) {
      this.timer = setInterval(this.add, 1000)
    } else if (!this.props.playing && prevProps.playing){
      clearInterval(this.timer)
    }
  }

  add = () => {
    const absTime = this.state.absTime + 1000
    const relTime = moment(this.state.relTime).add(1, 'second').format('MM/DD/YYYY h:mm:ss A')
    const remainingTime = this.state.remainingTime - 1000
    this.setState({absTime, relTime, remainingTime,})
  }

  render() {
    return (
      <div className={classes.Clocks}>
        <div className={classes.AbsClocks}>
          <div className={classes.AbsTime}>{msToTime(this.state.absTime)}</div>
          <div className={classes.AbsTime}>{msToTime(this.state.remainingTime)}</div>
        </div>
        <div className={classes.RelTime}>{this.state.relTime}</div>

      </div>
    )
  }
}

export default Clock;
