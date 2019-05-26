import React, { Component } from 'react';
import PropTypes from 'prop-types';
import msToTime from './Clock.utils';
import classes from './clock.css';

class Clock extends Component {
  prevUpdateTime = 0; // Used to optimize updates...only update when a full second has passed

  shouldComponentUpdate(nextProps) {
    const { relTime, startTime } = this.props;
    // Only update the clock when whole seconds have passed
    if (
      (nextProps.relTime - this.prevUpdateTime > 999 &&
        nextProps.relTime !== relTime) ||
      nextProps.changingIndex ||
      (!startTime && nextProps.startTime)
    ) {
      this.prevUpdateTime = nextProps.relTime;
      return true;
    }
    return false;
  }

  render() {
    const { duration, relTime } = this.props;
    return (
      <div className={classes.ClockContainer}>
        <div className={classes.StartTime}>{msToTime(relTime)}</div>
        <div className={classes.Seperator}>/</div>
        {/* <div className={classes.CenterTime}>{absTime}</div> */}
        <div className={classes.EndTime}>{msToTime(duration - relTime)}</div>
      </div>
    );
  }
}

Clock.propTypes = {
  startTime: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  relTime: PropTypes.number.isRequired,
  changingIndex: PropTypes.bool.isRequired,
};

export default Clock;
