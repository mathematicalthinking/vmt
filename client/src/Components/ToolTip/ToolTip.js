/**
 * ANY PARENT OF THIS COMPONENT MUST HAVE position: relative.
 */

import React, { Component } from "react";
import classes from "./toolTip.css";
class ToolTip extends Component {
  state = {
    visible: false
  };

  setVisible = () => this.setState({ visible: true });
  setHidden = () => this.setState({ visible: false });

  render() {
    return (
      <div
        className={classes.Container}
        onMouseLeave={this.setHidden}
        onMouseEnter={this.setVisible}
      >
        {this.state.visible ? (
          <span
            className={classes.ToolTipText}
            // style={{ visibility: this.state.visible ? "visible" : "hidden" }}
          >
            {this.props.text}
          </span>
        ) : null}
        <div>{this.props.children}</div>
      </div>
    );
  }
}

export default ToolTip;
