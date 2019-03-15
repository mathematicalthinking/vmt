import React, { Component } from "react";

class Event extends Component {
  state = {};

  render() {
    return <div>{this.props.event.description}</div>;
  }
}

export default Event;
