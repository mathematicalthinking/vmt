import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updatedActivity } from '../../store/actions';
import { Aux, Modal } from '../../Components';
import { WorkspaceLayout } from '../../Layout';
import NewTabForm from './NewTabForm';
class ActivityWorkspace extends Component {

  state = {
    currentTab: 0,
    creatingNewTab: false,
  }

  changTab = (index) => {
    this.setState({currentTab: index})
  }

  createNewTab = () => {
    this.setState({creatingNewTab: true})
  }

  closeModal = () => {
    this.setState({creatingNewTab: false})
  }

  render() {
    console.log(this.props.activity)
    return (
      <Aux>
        <WorkspaceLayout
            // activeMember={this.state.activeMember}
            room={this.props.activity} // THIS IS NO GOOD...WE SHOULD CHANGE THE ROOM ATTR TO RESOURCE THAT CAN ACCEPT EITHER A ROOM OR AN ACTIVITY
            user={this.props.user}
            role='facilitator' // oh shit role is taken...its for a11y  stuff
            currentTab={this.state.currentTab}
            // updateRoom={this.props.updateRoom}
            updatedActivity={this.props.updatedActivity}
            inControl={true}
            activityWorkspace={true}
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
      </Aux>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  console.log(ownProps)
  return {
    activity: state.activities.byId[ownProps.match.params.activity_id],
    user: state.user
  }
}

export default connect(mapStateToProps, { updatedActivity, })(ActivityWorkspace);