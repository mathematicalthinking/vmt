import React, { Component } from "react";
import ReactCSSTRansitionGroup from "react-addons-css-transition-group";
import classes from "./errorToast.css";
class ErrorToast extends Component {
  state = {
    style: {}
  };

  componentDidMount() {
    this.setState({
      style: {
        bottom: "100px",
        opacity: 1
      }
    });
    setTimeout(() => {
      this.setState({ bottom: "-200px", opacity: 0 });
    }, 1600);
  }

  render() {
    return (
      // @TODO TRANSITION GROUP IS NOT WORKING AS IS
      <ReactCSSTRansitionGroup
        transitionName="example"
        transitionAppear={true}
        transitionAppearTimeout={1000}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={1000}
      >
        <div
          key={"error"}
          className={classes.Container}
          style={this.state.style}
        >
          {this.props.children}
        </div>
      </ReactCSSTRansitionGroup>
    );
  }
}

export default ErrorToast;
