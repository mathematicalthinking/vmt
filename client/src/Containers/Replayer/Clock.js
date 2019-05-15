import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { msToTime } from './Clock.utils.js';
import classes from './clock.css';

class Clock extends Component {
  prevUpdateTime = 0; // Used to optimize updates...only update when a full second has passed

  shouldComponentUpdate(nextProps) {
    // Only update the clock when whole seconds have passed
    if (
      (nextProps.relTime - this.prevUpdateTime > 999 &&
        nextProps.relTime !== this.props.relTime) ||
      nextProps.changingIndex ||
      (!this.props.startTime && nextProps.startTime)
    ) {
      this.prevUpdateTime = nextProps.relTime;
      return true;
    }
    return false;
  }

  render() {
    return (
      <div className={classes.ClockContainer}>
        <div className={classes.StartTime}>{msToTime(this.props.relTime)}</div>
        <div className={classes.Seperator}>/</div>
        {/* <div className={classes.CenterTime}>{absTime}</div> */}
        <div className={classes.EndTime}>
          {msToTime(this.props.duration - this.props.relTime)}
        </div>
      </div>
    );
  }
}

Clock.propTypes = {
  startTime: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  relTime: PropTypes.number.isRequired,
  playing: PropTypes.bool.isRequired,
  changingIndex: PropTypes.bool.isRequired,
};

export default Clock;
