import React, { Component } from "react";
import { Modal } from "../../Components";
class FromActivity extends Component {
  render() {
    return <Modal show={this.props.show} />;
  }
}

export default FromActivity;
