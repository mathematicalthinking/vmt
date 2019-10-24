import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './eventDesc.css';

class EventDesc extends Component {
  state = {
    show: false,
  };

  mouseEnter = () => {
    const { dragging } = this.props;
    if (!dragging) {
      this.setState({ show: true });
    }
  };

  mouseExit = () => {
    const { dragging } = this.props;
    if (!dragging) {
      this.setState({ show: false });
    }
  };

  render() {
    const { entry, offset, color } = this.props;
    const { show } = this.state;
    const offS = offset > 99 ? `calc(${offset}% - 4px)` : `${offset}%`;
    return (
      <div
        style={{
          backgroundColor: show ? '#2D91F2' : color,
          left: offS,
        }}
        className={classes.Event}
        onPointerEnter={this.mouseEnter}
        onPointerOut={this.mouseExit}
        data-testclass="event-desc"
      >
        <div
          className={classes.EventDetails}
          style={{
            left: `calc(${offset}% - 50px)`,
            display: `${show ? 'flex' : 'none'}`,
          }}
        >
          {entry.description || entry.text || entry.message}
        </div>
      </div>
    );
  }
}

EventDesc.propTypes = {
  entry: PropTypes.shape({}).isRequired,
  offset: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  dragging: PropTypes.bool.isRequired,
};
export default EventDesc;
