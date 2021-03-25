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
import {
  Modal,
  TextInput,
  Button,
  Loading,
  SelectionList,
} from '../../Components';
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
import ModalClasses from '../../Components/UI/Modal/modal.css';

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
      newName: '',
      selectedTabIdsToCopy: [],
      copyActivityError: null,
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
    const { activity } = this.props;
    this.setState({
      addingToMyActivities: true,
      selectedTabIdsToCopy: activity.tabs.map((t) => t._id),
    });
  };

  createNewActivity = () => {
    const { activity } = this.props;
    const copy = { ...activity };
    const { user, connectCreateActivity, history } = this.props;
    const { newName, selectedTabIdsToCopy } = this.state;

    if (!selectedTabIdsToCopy.length > 0) {
      this.setState({
        copyActivityError: 'Please select at least one tab to copy',
      });
      return;
    }

    if (!newName) {
      this.setState({
        copyActivityError: 'Please provide a name for your new activity',
      });
      return;
    }
    copy.activities = [copy._id];
    delete copy._id;
    delete copy.createdAt;
    delete copy.updatedAt;
    delete copy.course;
    delete copy.courses;
    copy.creator = user._id;
    copy.name = newName;
    copy.tabs = copy.tabs.map((tab) => tab._id);
    copy.selectedTabIds = selectedTabIdsToCopy;
    connectCreateActivity(copy);
    this.setState({ addingToMyActivities: false, selectedTabIdsToCopy: [] });
    history.push('/myVMT/activities');
  };

  setFirstTabLoaded = () => {
    this.setState({ isFirstTabLoaded: true });
  };

  goBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  addTabIdToCopy = (event, id) => {
    const { selectedTabIdsToCopy } = this.state;
    if (selectedTabIdsToCopy.indexOf(id) === -1) {
      this.setState({ selectedTabIdsToCopy: [...selectedTabIdsToCopy, id] });
    } else {
      this.setState({
        selectedTabIdsToCopy: selectedTabIdsToCopy.filter(
          (tabId) => tabId !== id
        ),
      });
    }
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
      newName,
      selectedTabIdsToCopy,
      copyActivityError,
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
          <Loading message="Preparing your activity..." />
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
        <Modal
          show={addingToMyActivities}
          closeModal={() =>
            this.setState({
              addingToMyActivities: false,
              copyActivityError: null,
            })
          }
        >
          <TextInput
            show={addingToMyActivities}
            light
            focus
            name="new name"
            value={newName}
            change={(event) => {
              this.setState({ newName: event.target.value });
            }}
            label="New Activity Name"
          />
          {activity && activity.tabs.length > 1 ? (
            <div>
              <p>Choose at least one tab to include</p>
              <SelectionList
                listToSelectFrom={activity.tabs}
                selectItem={this.addTabIdToCopy}
                selected={selectedTabIdsToCopy}
              />
            </div>
          ) : null}
          {copyActivityError ? (
            <div className={ModalClasses.Error}>{copyActivityError}</div>
          ) : null}

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
