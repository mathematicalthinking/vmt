import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './chat.css';
import ToolTip from '../ToolTip/ToolTip';

class Event extends Component {
  state = {};
  render() {
    const { event } = this.props;
    const { color, description, key } = event;
    return (
      <ToolTip text={description} key={key}>
        <div className={classes.Event} style={{ background: color }} />
      </ToolTip>
    );
  }
}

Event.propTypes = {
  event: PropTypes.shape({}).isRequired,
};
export default Event;
