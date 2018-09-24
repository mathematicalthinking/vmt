import React, { PureComponent } from 'react';
import classes from './replayer.css';
let seconds = 0;
let minutes = 0;
let hours = 0;
class Clock extends PureComponent {

  state = {
    absTime: '00:00:00',
    relTime: this.props.startTime
  }

  componentDidUpdate(prevProps) {
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
    let time = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    this.setState({absTime: time,})
  }

  render() {
    return (
      <div className={classes.Clocks}>
        <div className={classes.AbsTime}>{this.state.absTime}</div>
        <div className={classes.RelTime}>{this.state.relTime}</div>

      </div>
    )
  }
}

export default Clock;
