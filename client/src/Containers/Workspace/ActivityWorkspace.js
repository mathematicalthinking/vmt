import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  updatedActivity,
  updateActivityTab,
  setActivityStartingPoint,
  getCurrentActivity,
} from 'store/actions';
import { Modal, Loading } from 'Components';
import { WorkspaceLayout } from 'Layout';
import { TabTypes } from 'Model';
import { ROLE } from 'constants.js';
import { Tabs, RoomInfo, ActivityTools } from './index';
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
      graphs = activity.tabs.map((tab) => (
        <TabTypes.MathspaceTemplateEditor
          type={tab.tabType}
          key={tab._id}
          tab={tab}
          tabs={activity.tabs}
          activity={activity}
          role={role}
          user={user}
          currentTab={currentTabId || initialTabId}
          updateActivityTab={connectUpdateActivityTab}
          setFirstTabLoaded={this.setFirstTabLoaded}
          isFirstTabLoaded={isFirstTabLoaded}
        />
      ));

      tabs = (
        <Tabs
          tabs={activity.tabs}
          currentTabId={currentTabId || initialTabId}
          canCreate={role === ROLE.FACILITATOR}
          onChangeTab={this.changeTab}
          onCreateNewTab={this.createNewTab}
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
            role={role} // oh sh*t role is taken...its for a11y  stuff
            currentTabId={currentTabId || initialTabId}
            bottomRight={
              <ActivityTools
                owner={role === 'facilitator'}
                goBack={this.goBack}
                copy={this.addToMyActivities}
                tabs={activity.tabs}
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
            currentTabId={currentTabId}
          />
        </Modal>
        {addingToMyActivities && (
          <CreationModal
            closeModal={() => {
              this.setState({
                addingToMyActivities: false,
              });
            }}
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
  activity: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    tabs: PropTypes.arrayOf(
      PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string })
    ),
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({ activity_id: PropTypes.string }),
  }).isRequired,
  user: PropTypes.shape({ activities: PropTypes.arrayOf(PropTypes.string) })
    .isRequired,
  history: PropTypes.shape({ goBack: PropTypes.func }).isRequired,
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
  connect(mapStateToProps, {
    connectUpdatedActivity: updatedActivity,
    connectSetActivityStartingPoint: setActivityStartingPoint,
    connectGetCurrentActivity: getCurrentActivity,
    connectUpdateActivityTab: updateActivityTab,
  })(ActivityWorkspace)
);
