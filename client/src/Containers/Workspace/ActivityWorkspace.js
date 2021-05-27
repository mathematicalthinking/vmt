import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  updatedActivity,
  updateActivityTab,
  setActivityStartingPoint,
  getCurrentActivity,
} from '../../store/actions';
import { Modal, Loading } from '../../Components';
import {
  DesmosActivityGraph,
  DesmosActivity,
  GgbActivityGraph,
  CodePyretOrg,
  Tabs,
  RoomInfo,
  ActivityTools,
} from './index';
import { WorkspaceLayout } from '../../Layout';
import NewTabForm from '../Create/NewTabForm';
import CreationModal from './Tools/CreationModal';

class ActivityWorkspace extends Component {
  constructor(props) {
    super(props);
    const { activity } = this.props;
    this.state = {
      currentTabId:
        activity && activity.tabs.length > 0 ? activity.tabs[0]._id : null,
      creatingNewTab: false,
      addingToMyActivities: false,
      isFirstTabLoaded: false,
    };
  }

  componentDidMount() {
    const { match, connectGetCurrentActivity } = this.props;
    connectGetCurrentActivity(match.params.activity_id);
  }

  changeTab = (id) => {
    this.setState({ currentTabId: id });
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
    this.setState({
      addingToMyActivities: true,
    });
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
      currentTabId,
      isFirstTabLoaded,
      creatingNewTab,
      addingToMyActivities,
    } = this.state;
    let role = 'participant';
    let graphs;
    let tabs;

    let initialTabId = null;
    let initialTab = null;

    if (activity && !currentTabId) {
      // activity has been loaded, but currentTab has not been updated
      // in state. Just use the first tab from the fetched activity
      // as the initial tab. If a user changes tabs, the currentTabId will
      // be updated in state
      if (activity.tabs && activity.tabs.length > 0) {
        [initialTab] = activity.tabs;
        initialTabId = initialTab._id;
      }
    }
    if (activity && user.activities.indexOf(activity._id) >= 0) {
      role = 'facilitator';
    }
    if (activity && activity.tabs[0].name) {
      graphs = activity.tabs.map((tab) => {
        if (tab.tabType === 'desmos') {
          return (
            <DesmosActivityGraph
              key={tab._id}
              tab={tab}
              activity={activity}
              role={role}
              currentTab={currentTabId || initialTabId}
              updateActivityTab={connectUpdateActivityTab}
              setFirstTabLoaded={this.setFirstTabLoaded}
              isFirstTabLoaded={isFirstTabLoaded}
            />
          );
        }
        if (tab.tabType === 'desmosActivity') {
          return (
            <DesmosActivity
              key={tab._id}
              tab={tab}
              activity={activity}
              role={role}
              currentTab={currentTabId || initialTabId}
              updateActivityTab={connectUpdateActivityTab}
              setFirstTabLoaded={this.setFirstTabLoaded}
              isFirstTabLoaded={isFirstTabLoaded}
            />
          );
        }
        if (tab.tabType === 'pyret') {
          return (
            <CodePyretOrg
              key={tab._id}
              tab={tab}
              activity={activity}
              role={role}
              currentTab={currentTabId || initialTabId}
              updateActivityTab={connectUpdateActivityTab}
              setFirstTabLoaded={this.setFirstTabLoaded}
              isFirstTabLoaded={isFirstTabLoaded}
            />
          );
        }
        console.log('Building a geogebra thing');
        return (
          <GgbActivityGraph
            activity={activity}
            tabs={activity.tabs}
            currentTab={currentTabId || initialTabId}
            role={role}
            user={user}
            tab={tab}
            key={tab._id}
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
          currentTabId={currentTabId || initialTabId}
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
          <Loading message="Preparing your activity template..." />
        ) : null}
        {activity && activity.tabs[0].name ? (
          <WorkspaceLayout
            graphs={graphs}
            tabs={tabs}
            roomName={activity.name} // THIS IS NO GOOD...WE SHOULD CHANGE THE ROOM ATTR TO RESOURCE THAT CAN ACCEPT EITHER A ROOM OR AN ACTIVITY
            user={user}
            role={role} // oh shit role is taken...its for a11y  stuff
            currentTabId={currentTabId || initialTabId}
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
                currentTab={
                  activity.tabs.filter((t) => t._id === currentTabId)[0] ||
                  initialTab
                }
                updatedActivity={connectUpdatedActivity}
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
            updatedActivity={connectUpdatedActivity}
            user={user}
          />
        </Modal>
        {addingToMyActivities && (
          <CreationModal
            closeModal={this.closeCreate}
            isCreatingActivity={addingToMyActivities}
            populatedRoom={activity}
            user={user}
            currentTabId={currentTabId}
          />
        )}
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
  connectUpdateActivityTab: PropTypes.func.isRequired,
};
ActivityWorkspace.defaultProps = { temp: false, activity: null };
const mapStateToProps = (state, ownProps) => {
  return {
    activity: state.activities.byId[ownProps.match.params.activity_id],
    user: state.user,
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    {
      connectUpdatedActivity: updatedActivity,
      connectSetActivityStartingPoint: setActivityStartingPoint,
      connectGetCurrentActivity: getCurrentActivity,
      connectUpdateActivityTab: updateActivityTab,
    }
  )(ActivityWorkspace)
);
