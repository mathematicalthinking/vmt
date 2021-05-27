/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  DashboardLayout,
  SidePanel,
  ActivityDetails,
  ResourceList,
} from '../Layout/Dashboard';
import {
  Aux,
  Button,
  BreadCrumbs,
  TabList,
  EditText,
  TrashModal,
  Error,
} from '../Components';
import {
  getCourses,
  getRooms,
  updateActivity,
  getActivities,
  getCurrentActivity,
} from '../store/actions';
import { populateResource } from '../store/reducers';
import Access from './Access';

class Activity extends Component {
  constructor(props) {
    super(props);
    const { activity } = this.props;
    this.state = {
      owner: false,
      tabs: [{ name: 'Details' }, { name: 'Rooms' }, { name: 'Settings' }],
      editing: false,
      name: activity ? activity.name : null,
      description: activity ? activity.description : null,
      instructions: activity ? activity.instructions : null,
      privacySetting: activity ? activity.privacySetting : null,
      canAccess: false,
    };
  }

  componentDidMount() {
    const { activity, connectGetCurrentActivity, match } = this.props;
    if (!activity) {
      connectGetCurrentActivity(match.params.activity_id); // WHY ARE WE DOING THIS??
    } else {
      this.checkAccess();
    }
  }

  componentDidUpdate(prevProps) {
    const { activity, loading, user } = this.props;
    if (!activity) {
      return;
    }

    if (!prevProps.activity && activity) {
      const { name, description, instructions, privacySetting } = activity;
      this.setState({
        name,
        description,
        instructions,
        privacySetting,
      });
      this.checkAccess();
    }

    if (
      prevProps.loading.updateResource === null &&
      loading.updateResource === 'activity'
    ) {
      this.setState({
        name: activity.name,
        description: activity.description,
        privacySetting: activity.privacySetting,
        instructions: activity.instructions,
      });
    }

    if (prevProps.user.isAdmin !== user.isAdmin) {
      this.checkAccess();
    }
  }

  toggleEdit = () => {
    const { activity } = this.props;
    this.setState((prevState) => ({
      editing: !prevState.editing,
      name: activity.name,
      description: activity.description,
      privacySetting: activity.privacySetting,
      instructions: activity.instructions,
    }));
  };
  // options is for radioButton/checkbox inputs
  updateActivityInfo = (event, option) => {
    const { value, name } = event.target;
    this.setState({ [name]: option || value });
  };

  updateActivity = () => {
    const { connectUpdateActivity, activity } = this.props;
    const {
      name,
      instructions,
      details,
      privacySetting,
      description,
    } = this.state;
    const body = { name, details, instructions, privacySetting, description };
    Object.keys(body).forEach((key) => {
      if (body[key] === activity[key]) {
        delete body[key];
      }
    });
    connectUpdateActivity(activity._id, body);
    this.setState({
      editing: false,
    });
  };

  trashActivity = () => {
    this.setState({ trashing: true });
  };

  checkAccess() {
    const { activity, user } = this.props;
    const canEdit = activity.creator === user._id || user.isAdmin;

    // Need to develop this criteria for accessing/editing activities
    // For now just prevent non creators/admins from seeing private activities
    const canAccess = canEdit || activity.privacySetting === 'public';

    this.setState({ owner: canEdit, canAccess });
  }

  render() {
    const {
      activity,
      course,
      match,
      user,
      loading,
      updateFail,
      updateKeys,
      rooms,
      history,
      connectUpdateActivity,
    } = this.props;
    const {
      editing,
      privacySetting,
      name,
      description,
      instructions,
      owner,
      tabs,
      trashing,
      canAccess,
    } = this.state;
    if (activity && canAccess) {
      const { resource } = match.params;
      const additionalDetails = {
        type: activity.roomType,
        privacy: (
          <Error
            error={updateFail && updateKeys.indexOf('privacySetting') > -1}
          >
            <EditText
              change={this.updateActivityInfo}
              inputType="radio"
              editing={editing}
              options={['public', 'private']}
              name="privacySetting"
            >
              {privacySetting}
            </EditText>
          </Error>
        ),
      };

      let crumbs = [{ title: 'My VMT', link: '/myVMT/templates' }];
      if (course) {
        crumbs = [
          { title: 'My VMT', link: '/myVMT/courses' },
          {
            title: `${course.name}`,
            link: `/myVMT/courses/${course._id}/templates`,
          },
          {
            title: `${activity.name}`,
            link: `/myVMT/courses/${course._id}/templates/${
              activity._id
            }/details`,
          },
        ];
      } else {
        crumbs.push({
          title: `${activity.name}`,
          link: `/myVMT/templates/${activity._id}/details`,
        });
      }

      let mainContent = (
        <ActivityDetails
          activity={activity}
          update={this.updateActivityInfo}
          instructions={instructions}
          editing={editing}
          owner={owner || user.isAdmin}
          toggleEdit={this.toggleEdit}
          userId={user._id}
          course={course}
          loading={loading}
          canAccess={canAccess}
        />
      );

      if (resource === 'rooms') {
        mainContent = (
          <ResourceList
            userResources={activity.rooms.map((roomId) => rooms[roomId])}
            notifications={[]}
            user={user}
            resource={resource}
            parentResource={course ? 'courses' : 'activities'}
            parentResourceId={course ? course._id : activity._id}
            activityOwner={owner || user.isAdmin}
          />
        );
      }

      return (
        <Aux>
          <DashboardLayout
            breadCrumbs={
              <BreadCrumbs crumbs={crumbs} notifications={user.notifications} />
            }
            sidePanel={
              <SidePanel
                image={activity.image}
                editing={editing}
                name={
                  <Error error={updateFail && updateKeys.indexOf('name')}>
                    <EditText
                      change={this.updateActivityInfo}
                      inputType="title"
                      name="name"
                      editing={editing}
                    >
                      {name}
                    </EditText>
                  </Error>
                }
                subTitle={
                  <Error
                    error={updateFail && updateKeys.indexOf('description')}
                  >
                    <EditText
                      change={this.updateActivityInfo}
                      inputType="text"
                      name="description"
                      editing={editing}
                    >
                      {description}
                    </EditText>
                  </Error>
                }
                owner={owner || user.isAdmin}
                additionalDetails={additionalDetails}
                editButton={
                  owner || user.isAdmin ? (
                    <Aux>
                      <div
                        role="button"
                        style={{
                          display: editing ? 'none' : 'block',
                        }}
                        data-testid="edit-template"
                        onClick={this.toggleEdit}
                        onKeyPress={this.toggleEdit}
                        tabIndex="-1"
                      >
                        Edit Template <i className="fas fa-edit" />
                      </div>
                      {editing ? (
                        // @TODO this should be a resuable component
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                          }}
                        >
                          <Button
                            click={this.updateActivity}
                            data-testid="save-template"
                            theme="Small"
                          >
                            Save
                          </Button>
                          <Button
                            click={this.trashActivity}
                            data-testid="trash-template"
                            theme="Danger"
                          >
                            <i className="fas fa-trash-alt" />
                          </Button>
                          <Button click={this.toggleEdit} theme="Cancel">
                            Cancel
                          </Button>
                        </div>
                      ) : null}
                    </Aux>
                  ) : null
                }
              />
            }
            mainContent={mainContent}
            tabs={<TabList routingInfo={match} tabs={tabs} />}
          />
          {trashing ? (
            <TrashModal
              resource="activity"
              resourceId={activity._id}
              update={connectUpdateActivity}
              show={trashing}
              closeModal={() => {
                this.setState({ trashing: false });
              }}
              history={history}
            />
          ) : null}
        </Aux>
      );
    }
    if (!activity) return <div>Loading</div>;

    // cannot access
    return (
      <Access
        closeModal={() =>
          history.push('/community/templates?privacy=all&roomType=all')
        }
        resource="activities"
        resourceId={match.params.activity_id}
        userId={user._id}
        username={user.username}
        privacySetting={activity.privacySetting}
        owners={[activity.creator]}
      />
    );
  }
}

Activity.propTypes = {
  match: PropTypes.shape({}).isRequired,
  activity: PropTypes.shape({}),
  user: PropTypes.shape({}).isRequired,
  course: PropTypes.shape({}),
  history: PropTypes.shape({}).isRequired,
  loading: PropTypes.bool.isRequired,
  updateFail: PropTypes.bool.isRequired,
  updateKeys: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  rooms: PropTypes.shape({}).isRequired,
  // connectGetCourses: PropTypes.func.isRequired,
  // connectGetRooms: PropTypes.func.isRequired,
  connectUpdateActivity: PropTypes.func.isRequired,
  // connectGetActivities: PropTypes.func.isRequired,
  connectGetCurrentActivity: PropTypes.func.isRequired,
};

Activity.defaultProps = {
  course: null,
  activity: null,
};

const mapStateToProps = (state, ownProps) => {
  // eslint-disable-next-line camelcase
  const { activity_id, course_id } = ownProps.match.params;
  return {
    activity: state.activities.byId[activity_id],
    populatedActivity: state.activities.byId[activity_id]
      ? populateResource(state, 'activities', activity_id, ['rooms'])
      : {},
    course: state.courses.byId[course_id],
    rooms: state.rooms.byId,
    userId: state.user._id,
    user: state.user,
    loading: state.loading.loading,
    updateFail: state.loading.updateFail,
    updateKeys: state.loading.updateKeys,
  };
};

export default connect(
  mapStateToProps,
  {
    connectGetCourses: getCourses,
    connectGetRooms: getRooms,
    connectUpdateActivity: updateActivity,
    connectGetActivities: getActivities,
    connectGetCurrentActivity: getCurrentActivity,
  }
)(Activity);
