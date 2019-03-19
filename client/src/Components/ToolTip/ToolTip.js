import React, { Component } from "react";
import classes from "./toolTip.css";
class ToolTip extends Component {
  state = {
    visible: false,
    x: null,
    y: null
  };

  toolTipSource = React.createRef(); // I.e. the element hovered

  setVisible = () => {
    let { top, x, width } = this.toolTipSource.current.getBoundingClientRect();
    this.setState({ x: x + width / 2, y: top - 55, visible: true });
  };
  setHidden = () => this.setState({ visible: false });

  render() {
    return (
      <div
        className={classes.Container}
        onMouseLeave={this.setHidden}
        onMouseEnter={this.setVisible}
        ref={this.toolTipSource}
      >
        {this.state.visible ? (
          <div
            className={classes.ToolTipText}
            style={{ top: this.state.y, left: this.state.x, height: 47 }}
          >
            {this.props.text}
          </div>
        ) : null}
        {this.props.children}
      </div>
    );
  }
}

export default ToolTip;
