import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  updatedActivity,
  updateActivityTab,
  setActivityStartingPoint,
  getCurrentActivity,
  createActivity,
} from '../../store/actions';
import { Aux, Modal, TextInput, Button } from '../../Components';
import { WorkspaceLayout } from '../../Layout';
import NewTabForm from './NewTabForm';
class ActivityWorkspace extends Component {

  state = {
    currentTab: 0,
    creatingNewTab: false,
    addingToMyActivities: false,
    newName: '',
  }

  componentDidMount() {
    if (!this.props.activity ||  !this.props.activity.tabs[0].name) {
      this.props.getCurrentActivity(this.props.match.params.activity_id)
    }
  }

  changeTab = (index) => {
    this.setState({currentTab: index})
  }

  createNewTab = () => {
    this.setState({creatingNewTab: true})
  }

  closeModal = () => {
    this.setState({creatingNewTab: false})
  }

  setStartingPoint = () => {
    this.props.setActivityStartingPoint(this.props.activity._id)
  }

  addToMyActivities = () => {
    // create a new activity that belongs to the current user
    this.setState({addingToMyActivities: true})
  }

  createNewActivity = () => {
    let activity = {...this.props.activity}
    delete activity._id;
    delete activity.createdAt;
    delete activity.updatedAt;
    activity.creator = this.props.user._id
    activity.name = this.state.newName
    this.props.createActivity(activity)
    this.setState({addingToMyActivities: false})
    this.props.history.push('/community/activities')
  }

  render() {
    let role = 'participant'
    if (this.props.activity && this.props.user.activities.indexOf(this.props.activity._id) >= 0) {
      role = 'facilitator'
    }
    return (
      this.props.activity
        ? <Aux>
          <WorkspaceLayout
              // activeMember={this.state.activeMember}
              room={this.props.activity} // THIS IS NO GOOD...WE SHOULD CHANGE THE ROOM ATTR TO RESOURCE THAT CAN ACCEPT EITHER A ROOM OR AN ACTIVITY
              user={this.props.user}
              role={role} // oh shit role is taken...its for a11y  stuff
              currentTab={this.state.currentTab}
              // updateRoom={this.props.updateRoom}
              updatedActivity={this.props.updatedActivity}
              updateActivityTab={this.props.updateActivityTab}
              inControl={true}
              activityWorkspace={true}
              copyActivity={this.addToMyActivities}
              // startNewReference={this.startNewReference}
              // referencing={this.state.referencing}
              // showReference={this.showReference}
              // showingReference={this.state.showingReference}
              // clearReference={this.clearReference}
              // referToEl={this.state.referToEl}
              // referToCoords={this.state.referToCoords}
              // referFromCoords={this.state.referFromCoords}
              // referFromEl={this.state.referFromEl}
              // setToElAndCoords={this.setToElAndCoords}
              // setFromElAndCoords={this.setFromElAndCoords}
              createNewTab={this.createNewTab}
              changeTab={this.changeTab}
              setStartingPoint={this.setStartingPoint}
          />
          <Modal show={this.state.creatingNewTab} closeModal={this.closeModal}>
            <NewTabForm activity={this.props.activity} closeModal={this.closeModal} updatedActivity={this.props.updatedActivity}/>
          </Modal>
          <Modal show={this.state.addingToMyActivities} closeModal={() => this.setState({addingToMyActivities: false})}>
            <TextInput show={this.state.addingToMyActivities} light focus={true} value={this.state.newName} change={(event) => {this.setState({newName: event.target.value})}} label={'New Activity Name'}/>
            <Button click={this.createNewActivity}>Copy Activity</Button>
          </Modal>
        </Aux>
        : <Modal show={this.state.loading} message='Loading...'/>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    activity: state.activities.byId[ownProps.match.params.activity_id],
    user: state.user
  }
}

export default connect(mapStateToProps, { updatedActivity, setActivityStartingPoint, getCurrentActivity, createActivity, updateActivityTab })(ActivityWorkspace);