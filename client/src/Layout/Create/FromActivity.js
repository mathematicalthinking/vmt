import React, { Component } from 'react';
import { Modal, RadioBtn, Button } from '../../Components';
import classes from './create.css'
class FromActivity extends Component {

  state = {
    community: true,
    ownResources: false,
    thisCourse: false,
  }
  
  render() {
    return (
      <Modal show={this.props.show} closeModal={this.props.close}>
        <div className={classes.Container}>
          <h3 className={classes.Title}>Create from an Existing Activity</h3>
          <div className={classes.Form}>
            <div className={classes.FormSection}>
              <div className={classes.VerticalButtons}>
                <RadioBtn 
                  name='community' 
                  checked={this.state.community} 
                  check={() => this.setState({community: true, ownResources: false, thisCoursae: false})}
                >From the Community</RadioBtn>
                <RadioBtn 
                  name='ownActivities' 
                  checked={this.state.ownResources} 
                  check={() => this.setState({ownResources: true, thisCourse: false, community: false})}
                >From Your Activities</RadioBtn>
                {this.props.course ? 
                <RadioBtn 
                  name='ownActivities' 
                  checked={this.state.thisCourse} 
                  check={() => this.setState({thisCourse: true, ownResources: false, community: false})}
                >From This Course</RadioBtn> : null}
              </div>
            </div>
            <div className={classes.Submit}>
              <Button>Go</Button>
              <Button click={this.props.close}>Cancel</Button>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default FromActivity