import React, { Component } from 'react';
import classes from './chat.css';
import ToolTip from '../ToolTip/ToolTip';
class Event extends Component {
  state = {};
  render() {
    let { color, description, id, key } = this.props.event;
    return (
      <ToolTip text={description} key={key}>
        <div className={classes.Event} style={{ background: color }} />
      </ToolTip>
    );
  }
}

export default Event;
