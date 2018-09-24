import React, { PureComponent } from 'react';
import classes from './replayer.css';
import moment from 'moment';
let seconds = 0;
let minutes = 0;
let hours = 0;

const msToTime = (duration) => {
  console.log(duration)
  let seconds = parseInt((duration / 1000) % 60, 10);
  let minutes = parseInt((duration / (1000 * 60)) % 60, 10);
  let hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);
  console.log(hours, minutes, seconds)
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds ;
}


class Clock extends PureComponent {

  state = {
    absTime: '00:00:00',
    remainingTime: this.props.duration,
    relTime: this.props.startTime
  }


  componentDidUpdate(prevProps) {
    console.log(this.state.remainingTime)
    if (!prevProps.playing && this.props.playing) {
      this.timer = setInterval(this.add, 1000)
    } else if (!this.props.playing && prevProps.playing){
      console.log('clear timer')
      clearInterval(this.timer)
    }
  }

  add = () => {
    seconds++;
    if (seconds >= 60) {
      seconds = 0;
      minutes++;
      if (minutes >= 60) {
        minutes = 0;
        hours++;
      }
    }
    const absTime = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    const relTime = moment(this.state.relTime).add(1, 'second').format('MM/DD/YYYY h:mm:ss A')
    const remainingTime = this.state.remainingTime - 1000
    this.setState({absTime, relTime, remainingTime,})
  }

  render() {
    console.log(this.props)
    return (
      <div className={classes.Clocks}>
        <div className={classes.AbsClocks}>
          <div className={classes.AbsTime}>{this.state.absTime}</div>
          <div className={classes.AbsTime}>{msToTime(this.state.remainingTime)}</div>
        </div>
        <div className={classes.RelTime}>{this.state.relTime}</div>

      </div>
    )
  }
}

export default Clock;
