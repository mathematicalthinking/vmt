import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './chat.css';
import ToolTip from '../ToolTip/ToolTip';

class Event extends Component {
  state = {};
  render() {
    const { event, id } = this.props;
    const { color, description } = event;
    return (
      <div className={classes.EventContainer}>
        <ToolTip text={description} key={id}>
          <div className={classes.Event} style={{ background: color }} />
        </ToolTip>
      </div>
    );
  }
}

Event.propTypes = {
  id: PropTypes.string.isRequired,
  event: PropTypes.shape({}).isRequired,
};
export default Event;
