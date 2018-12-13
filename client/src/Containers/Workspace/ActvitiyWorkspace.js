import React, { Component } from 'react';
import { connect } from 'react-redux';
import { WorkspaceLayout } from '../../Layout';
class ActivityWorkspace extends Component {

  state = {
    currentTab: 0,

  }

  render() {
    return (
      <WorkspaceLayout
          // activeMember={this.state.activeMember}
          room={this.props.activity}
          user={this.props.user}
          role='facilitator'
          currentTab={this.state.currentTab}
          updateRoom={this.props.updateRoom}
          updatedRoom={this.props.updatedRoom}
          inControl={true}
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
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    activity: state.activities.byId[ownProps.activitiy_id],
    user: state.user
  }
}

export default connect(mapStateToProps, null)(ActivityWorkspace);