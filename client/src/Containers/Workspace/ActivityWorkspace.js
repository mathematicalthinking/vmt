import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  updatedActivity,
  updateActivityTab,
  setActivityStartingPoint,
  getCurrentActivity,
  createActivity,
} from '../../store/actions';
import { Modal, TextInput, Button, Loading } from '../../Components';
import {
  DesmosActivityGraph,
  GgbActivityGraph,
  Tabs,
  RoomInfo,
  ActivityTools,
} from './index';
import { WorkspaceLayout } from '../../Layout';
import NewTabForm from '../Create/NewTabForm';

class ActivityWorkspace extends Component {
  state = {
    currentTab: 0,
    creatingNewTab: false,
    addingToMyActivities: false,
    isFirstTabLoaded: false,
    newName: '',
  };

  componentDidMount() {
    const { activity, match, connectGetCurrentActivity } = this.props;
    if (!activity || !activity.tabs[0].name) {
      connectGetCurrentActivity(match.params.activity_id);
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
    const { connectSetActivityStartingPoint, activity } = this.props;
    connectSetActivityStartingPoint(activity._id);
  };

  addToMyActivities = () => {
    // create a new activity that belongs to the current user
    this.setState({ addingToMyActivities: true });
  };

  createNewActivity = () => {
    const { activity } = { ...this.props };
    const { user, connectCreateActivity, history } = this.props;
    const { newName } = this.state;
    activity.activities = [activity._id];
    delete activity._id;
    delete activity.createdAt;
    delete activity.updatedAt;
    delete activity.course;
    delete activity.courses;
    activity.creator = user._id;
    activity.name = newName;
    activity.tabs = activity.tabs.map(tab => tab._id);
    connectCreateActivity(activity);
    this.setState({ addingToMyActivities: false });
    history.push('/myVMT/activities');
  };

  setFirstTabLoaded = () => {
    this.setState({ isFirstTabLoaded: true });
  };

  goBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const {
      activity,
      user,
      connectUpdateActivityTab,
      connectUpdatedActivity,
      temp,
    } = this.props;
    const {
      currentTab,
      isFirstTabLoaded,
      creatingNewTab,
      addingToMyActivities,
      newName,
    } = this.state;
    let role = 'participant';
    let graphs;
    let tabs;
    if (activity && user.activities.indexOf(activity._id) >= 0) {
      role = 'facilitator';
    }
    if (activity && activity.tabs[0].name) {
      graphs = activity.tabs.map((tab, i) => {
        if (tab.tabType === 'desmos') {
          return (
            <DesmosActivityGraph
              activity={activity}
              role={role}
              tabId={i}
              key={tab._id}
              currentTab={currentTab}
              updateActivityTab={connectUpdateActivityTab}
              setFirstTabLoaded={this.setFirstTabLoaded}
              isFirstTabLoaded={isFirstTabLoaded}
            />
          );
        }
        return (
          <GgbActivityGraph
            tabs={activity.tabs}
            currentTab={currentTab}
            role={role}
            user={user}
            tabId={i}
            key={tab._id}
            activity={activity}
            updateActivityTab={connectUpdateActivityTab}
            setFirstTabLoaded={this.setFirstTabLoaded}
            isFirstTabLoaded={isFirstTabLoaded}
          />
        );
      });
      tabs = (
        <Tabs
          activity
          tabs={activity.tabs}
          currentTab={currentTab}
          participantCanCreate={false}
          memberRole={role}
          changeTab={this.changeTab}
          createNewTab={this.createNewTab}
        />
      );
    }
    return (
      <Fragment>
        {!isFirstTabLoaded ? (
          <Loading message="Preparing your activity..." />
        ) : null}
        {activity && activity.tabs[0].name ? (
          <WorkspaceLayout
            graphs={graphs}
            tabs={tabs}
            // activeMember={this.state.activeMember}
            roomName={activity.name} // THIS IS NO GOOD...WE SHOULD CHANGE THE ROOM ATTR TO RESOURCE THAT CAN ACCEPT EITHER A ROOM OR AN ACTIVITY
            user={user}
            role={role} // oh shit role is taken...its for a11y  stuff
            currentTab={currentTab}
            // updateRoom={this.props.updateRoom}
            bottomRight={
              <ActivityTools
                owner={role === 'facilitator'}
                goBack={this.goBack}
                copy={this.addToMyActivities}
              />
            }
            bottomLeft={
              <RoomInfo
                temp={temp}
                role={role}
                updateRoom={connectUpdatedActivity}
                room={activity}
                currentTab={currentTab}
              />
            }
            updatedActivity={connectUpdatedActivity}
            updateActivityTab={connectUpdateActivityTab}
            copyActivity={this.addToMyActivities}
            inControl
            activity
            createNewTab={this.createNewTab}
            changeTab={this.changeTab}
            setStartingPoint={this.setStartingPoint}
          />
        ) : null}
        <Modal show={creatingNewTab} closeModal={this.closeModal}>
          <NewTabForm
            activity={activity}
            closeModal={this.closeModal}
            updatedRoom={connectUpdatedActivity}
            user={user}
          />
        </Modal>
        <Modal
          show={addingToMyActivities}
          closeModal={() => this.setState({ addingToMyActivities: false })}
        >
          <TextInput
            show={addingToMyActivities}
            light
            focus
            name="new name"
            value={newName}
            change={event => {
              this.setState({ newName: event.target.value });
            }}
            label="New Activity Name"
          />
          <Button click={this.createNewActivity}>Copy Activity</Button>
        </Modal>
      </Fragment>
    );
  }
}

ActivityWorkspace.propTypes = {
  activity: PropTypes.shape({}),
  match: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({}).isRequired,
  temp: PropTypes.bool,
  connectUpdatedActivity: PropTypes.func.isRequired,
  connectSetActivityStartingPoint: PropTypes.func.isRequired,
  connectGetCurrentActivity: PropTypes.func.isRequired,
  connectCreateActivity: PropTypes.func.isRequired,
  connectUpdateActivityTab: PropTypes.func.isRequired,
};
ActivityWorkspace.defaultProps = { temp: false, activity: null };
const mapStateToProps = (state, ownProps) => {
  return {
    activity: state.activities.byId[ownProps.match.params.activity_id],
    user: state.user,
  };
};

export default connect(
  mapStateToProps,
  {
    connectUpdatedActivity: updatedActivity,
    connectSetActivityStartingPoint: setActivityStartingPoint,
    connectGetCurrentActivity: getCurrentActivity,
    connectCreateActivity: createActivity,
    connectUpdateActivityTab: updateActivityTab,
  }
)(ActivityWorkspace);
