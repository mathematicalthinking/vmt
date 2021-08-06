import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './tools.css';
import ggbTools from './GgbIcons';

class Awareness extends Component {
  shouldComponentUpdate(nextProps) {
    const { lastEvent } = nextProps;
    if (lastEvent) {
      if (
        lastEvent.messageType === 'TEXT' &&
        (!lastEvent.reference || !lastEvent.description)
      ) {
        // only show messages with references && event descriptions
        return false;
      }
    }
    return true;
  }
  render() {
    const { lastEvent } = this.props;
    if (lastEvent) {
      return (
        <div
          className={classes.AwarenessDesc}
          data-testid="awareness-desc"
          title="Last event"
        >
          {lastEvent.description || lastEvent.text || lastEvent.message}
          <div className={classes.AwarenessIcon}>
            {lastEvent.action === 'mode' ? (
              <img
                data-testid="awareness-img"
                src={ggbTools[lastEvent.label].image}
                height={40}
                href={ggbTools[lastEvent.label].link}
                alt="tool_icon"
              />
            ) : // </ToolTip>
            null}
          </div>
        </div>
      );
    }
    return null;
  }
}

Awareness.propTypes = {
  lastEvent: PropTypes.shape({
    description: PropTypes.string,
    text: PropTypes.string,
    message: PropTypes.string,
    messageType: PropTypes.string,
  }),
};
Awareness.defaultProps = {
  lastEvent: null,
};

export default Awareness;
