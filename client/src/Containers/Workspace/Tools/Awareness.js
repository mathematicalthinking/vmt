import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Avatar, ToolTip, Aux } from "../../../Components";
import classes from './tools.css';
import ggbTools from './GgbIcons';

class Awareness extends Component {
  state = {
    // showToolTip: false,
  };

  shouldComponentUpdate(nextProps) {
    if (nextProps.lastEvent && nextProps.lastEvent.messageType === 'TEXT') {
      return false;
    }
    return true;
  }
  render() {
    const { lastEvent } = this.props;
    if (lastEvent) {
      return (
        <div className={classes.AwarenessDesc} data-testid="awareness-desc">
          {lastEvent.description || lastEvent.text || lastEvent.message}
          <div
            className={classes.AwarenessIcon}
            // onMouseOver={() => this.setState({ showToolTip: true })}
            // onFocus={() => this.setState({ showToolTip: true })}
            // onMouseOut={() => this.setState({ showToolTip: false })}
            // onBlur={() => this.setState({ showToolTip: false })}
          >
            {lastEvent.action === 'mode' ? (
              // <ToolTip
              //   visible={this.state.showToolTip}
              //   text={ggbTools[lastEvent.label].name
              //     .toLowerCase()
              //     .replace("_", " ")}
              // >
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
