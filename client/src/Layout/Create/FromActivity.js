import React, { Component } from 'react';
import { Modal } from '../../Components';
import classes from './create.css'
class FromActivity extends Component {
  
  render() {
    return (
      <Modal show={this.props.show}>
        <div className={classes.Container}>
          <h3>Create a Room From an Activity</h3>

        </div>
      </Modal>
    )
  }
}

export default FromActivity