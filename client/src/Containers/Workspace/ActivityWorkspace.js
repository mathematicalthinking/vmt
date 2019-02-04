import React, { Component } from "react";
import { connect } from "react-redux";
import {
  updatedActivity,
  updateActivityTab,
  setActivityStartingPoint,
  getCurrentActivity,
  createActivity
} from "../../store/actions";
import { Aux, Modal, TextInput, Button } from "../../Components";
import {
  DesmosActivityGraph,
  GgbActivityGraph,
  Tabs,
  RoomInfo,
  ActivityTools
} from "./index";
import { WorkspaceLayout } from "../../Layout";
import NewTabForm from "./NewTabForm";
class ActivityWorkspace extends Component {
  state = {
    currentTab: 0,
    creatingNewTab: false,
    addingToMyActivities: false,
    newName: ""
  };

  componentDidMount() {
    if (!this.props.activity || !this.props.activity.tabs[0].name) {
      this.props.getCurrentActivity(this.props.match.params.activity_id);
    }
  }

  changeTab = index => {
    this.setState({ currentTab: index });
  };

  createNewTab = () => {
    this.setState({ creatingNewTab: true });
  };

  closeModal = () => {
    this.setState({ creatingNewTab: false });
  };

  setStartingPoint = () => {
    this.props.setActivityStartingPoint(this.props.activity._id);
  };

  addToMyActivities = () => {
    // create a new activity that belongs to the current user
    this.setState({ addingToMyActivities: true });
  };

  createNewActivity = () => {
    let activity = { ...this.props.activity };
    activity.activities = [activity._id];
    delete activity._id;
    delete activity.createdAt;
    delete activity.updatedAt;
    delete activity.course;
    delete activity.courses;
    activity.creator = this.props.user._id;
    activity.name = this.state.newName;
    activity.tabs = activity.tabs.map(tab => tab._id);
    console.log(activity.tabs);
    this.props.createActivity(activity);
    this.setState({ addingToMyActivities: false });
    this.props.history.push("/myVMT/activities");
  };

  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    let { activity, user } = this.props;
    let role = "participant";
    if (activity && user.activities.indexOf(this.props.activity._id) >= 0) {
      role = "facilitator";
    }
    let graph;
    let tabs;

    if (activity && activity.tabs[0].name) {
      // This che
      if (
        this.props.activity.tabs[this.state.currentTab].tabType === "desmos"
      ) {
        graph = <DesmosActivityGraph />;
      } else {
        graph = (
          <GgbActivityGraph
            tabs={activity.tabs}
            currentTab={this.state.currentTab}
            role={role}
            user={user}
            activity={activity}
            updateActivityTab={this.props.updateActivityTab}
          />
        );
      }
      tabs = (
        <Tabs
          tabs={activity.tabs}
          currentTab={this.state.currentTab}
          role={role}
          changeTab={this.changeTab}
          createNewTab={this.createNewTab}
        />
      );
    }

    return this.props.activity ? (
      <Aux>
        <WorkspaceLayout
          graph={graph}
          tabs={tabs}
          // activeMember={this.state.activeMember}
          roomName={activity.name} // THIS IS NO GOOD...WE SHOULD CHANGE THE ROOM ATTR TO RESOURCE THAT CAN ACCEPT EITHER A ROOM OR AN ACTIVITY
          user={this.props.user}
          role={role} // oh shit role is taken...its for a11y  stuff
          currentTab={this.state.currentTab}
          // updateRoom={this.props.updateRoom}
          bottomRight={
            <ActivityTools
              owner={role === "facilitator"}
              goBack={this.goBack}
              copy={this.addToMyActivities}
            />
          }
          bottomLeft={
            <RoomInfo
              temp={this.props.temp}
              role={role}
              updateRoom={this.props.updateRoom}
              room={activity}
              currentTab={this.state.currentTab}
            />
          }
          updatedActivity={this.props.updatedActivity}
          updateActivityTab={this.props.updateActivityTab}
          copyActivity={this.addToMyActivities}
          inControl
          activity
          createNewTab={this.createNewTab}
          changeTab={this.changeTab}
          setStartingPoint={this.setStartingPoint}
        />
        <Modal show={this.state.creatingNewTab} closeModal={this.closeModal}>
          <NewTabForm
            activity={this.props.activity}
            closeModal={this.closeModal}
            updatedActivity={this.props.updatedActivity}
          />
        </Modal>
        <Modal
          show={this.state.addingToMyActivities}
          closeModal={() => this.setState({ addingToMyActivities: false })}
        >
          <TextInput
            show={this.state.addingToMyActivities}
            light
            focus={true}
            value={this.state.newName}
            change={event => {
              this.setState({ newName: event.target.value });
            }}
            label={"New Activity Name"}
          />
          <Button click={this.createNewActivity}>Copy Activity</Button>
        </Modal>
      </Aux>
    ) : (
      <Modal show={this.state.loading} message="Loading..." />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    activity: state.activities.byId[ownProps.match.params.activity_id],
    user: state.user
  };
};

export default connect(
  mapStateToProps,
  {
    updatedActivity,
    setActivityStartingPoint,
    getCurrentActivity,
    createActivity,
    updateActivityTab
  }
)(ActivityWorkspace);
