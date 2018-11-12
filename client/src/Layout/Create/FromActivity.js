import React, { Component } from 'react';
import { Modal, RadioBtn, Button } from '../../Components';
import { BoxList } from '../index';
import classes from './create.css'
class FromActivity extends Component {

  state = {
    community: true,
    ownResources: false,
    thisCourse: false,
  }
  
  render() {
    let list = []
    if (this.state.thisCourse) {
      list = this.props.courseActivities
    } else if (this.state.ownResources) list = this.props.userActivities;
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
                  check={() => this.setState({community: true, ownResources: false, thisCourse: false})}
                >From the Community</RadioBtn>
                <RadioBtn 
                  name='ownActivities' 
                  checked={this.state.ownResources} 
                  check={() => this.setState({ownResources: true, thisCourse: false, community: false})}
                >From Your Activities</RadioBtn>
                {this.props.course && (this.props.resource !== 'activities') ? 
                <RadioBtn 
                  name='ownActivities' 
                  checked={this.state.thisCourse} 
                  check={() => this.setState({thisCourse: true, ownResources: false, community: false})}
                >From This Course</RadioBtn> : null}
              </div>
            </div>
            <div className={classes.Submit}>
              <Button theme={"Small"} m={10}>Go</Button>
              <Button click={this.props.close} m={10}>Cancel</Button>
            </div>
            <div className={classes.ActivityList}>
              <BoxList list={list} selecting/>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default FromActivity