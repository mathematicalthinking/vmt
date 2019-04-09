import React, { Component } from "react";
import classes from "./toolTip.css";
class ToolTip extends Component {
  state = {
    visible: false,
    x: null,
    y: null
  };

  toolTipSource = React.createRef(); // I.e. the element hovered

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  setVisible = () => {
    if (this.props.delay) {
      console.log("delay...setting timer by ", this.props.delay);
      this.timer = setTimeout(() => {
        let {
          top,
          x,
          width
        } = this.toolTipSource.current.getBoundingClientRect();
        this.setState({ x: x + width / 2, y: top - 55, visible: true });
      }, this.props.delay);
    } else {
      let {
        top,
        x,
        width
      } = this.toolTipSource.current.getBoundingClientRect();
      this.setState({ x: x + width / 2, y: top - 55, visible: true });
    }
  };
  setHidden = () => {
    if (this.timer) clearTimeout(this.timer);
    this.setState({ visible: false });
  };

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
            style={{ top: this.state.y, left: this.state.x }}
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
