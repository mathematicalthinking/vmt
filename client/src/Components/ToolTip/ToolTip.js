import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './toolTip.css';

class ToolTip extends Component {
  state = {
    visible: false,
    x: null,
    y: null,
  };

  toolTipSource = React.createRef(); // I.e. the element hovered

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  setVisible = () => {
    const { delay } = this.props;
    if (delay) {
      this.timer = setTimeout(() => {
        const {
          top,
          x,
          width,
        } = this.toolTipSource.current.getBoundingClientRect();
        this.setState({ x: x + width / 2, y: top - 55, visible: true });
      }, delay);
    } else {
      const {
        top,
        x,
        width,
      } = this.toolTipSource.current.getBoundingClientRect();
      this.setState({ x: x + width / 2, y: top - 55, visible: true });
    }
  };
  setHidden = () => {
    if (this.timer) clearTimeout(this.timer);
    this.setState({ visible: false });
  };

  render() {
    const { color, text, children } = this.props;
    const { visible, x, y } = this.state;
    return (
      <div
        className={classes.Container}
        onMouseLeave={this.setHidden}
        onMouseEnter={this.setVisible}
        ref={this.toolTipSource}
      >
        {visible ? (
          <div
            className={
              color
                ? classes[color] || classes.ToolTipText
                : classes.ToolTipText
            }
            style={{ top: y, left: x }}
          >
            {text}
          </div>
        ) : null}
        {children}
      </div>
    );
  }
}

ToolTip.propTypes = {
  color: PropTypes.string,
  text: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
};

ToolTip.defaultProps = {
  color: 'black',
  delay: 0,
};

export default ToolTip;
