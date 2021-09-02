import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash/find';
import CourseMonitor from './Monitoring/CourseMonitor';
import { populateResource } from '../store/reducers';
import Members from './Members/Members';
import getUserNotifications from '../utils/notifications';

import {
  removeCourseMember,
  updateCourse,
  clearNotification,
  getCourse,
  requestAccess,
  grantAccess,
  updateUser,
} from '../store/actions';
import { DashboardLayout, SidePanel, ResourceList } from '../Layout/Dashboard';
import {
  Aux,
  Modal,
  Button,
  BreadCrumbs,
  TabList,
  EditText,
  TrashModal,
  Error,
} from '../Components';
import Access from './Access';

class Course extends Component {
  initialTabs = [
    { name: 'Rooms' },
    { name: 'Members' },
    { name: 'Activities' },
    { name: 'Preview' },
  ];

  constructor(props) {
    super(props);
    const { course } = this.props;
    this.state = {
      guestMode: true,
      tabs: [
        { name: 'Rooms' },
        { name: 'Members' },
        { name: 'Activities' },
        { name: 'Preview' },
      ],
      firstView: false,
      editing: false,
      invited: false,
      name: course ? course.name : null,
      description: course ? course.description : null,
      entryCode: course ? course.entryCode : null,
      privacySetting: course ? course.privacySetting : null,
      trashing: false,
      isAdmin: false,
    };
  }
  // SO we can reset the tabs easily

  componentDidMount() {
    const {
      course,
      notifications,
      match,
      connectClearNotification,
      connectGetCourse,
    } = this.props;
    if (course) {
      // this.props.getCourse(course._id); // What information are we getting here
      // this.props.getUser(user._id);
      let firstView = false;
      let invited = false;
      if (notifications.length > 0) {
        notifications.forEach((ntf) => {
          if (ntf.resourceId === course._id) {
            if (ntf.notificationType === 'grantedAccess') {
              firstView = true;
              connectClearNotification(ntf._id);
            } else if (ntf.notificationType === 'invitation') {
              invited = true;
              connectClearNotification(ntf._id);
            }
          }
        });
      }
      // check if we need to fetch data
      // this.checkForFetch();
      // Check user's permission level -- owner, member, or guest
      this.setState(
        {
          firstView,
          invited,
        },
        () => this.displayNotifications()
      );
      if (course.members) {
        this.checkAccess();
      }
    } else {
      connectGetCourse(match.params.course_id);
    }
  }

  componentDidUpdate(prevProps) {
    const { course, user, history, notifications, loading } = this.props;
    // The user has removed themself from this course and thus its no longer in the store
    if (!course) {
      return;
    }
    // If the user has been removed from this course go back to myVMT
    if (
      prevProps.user.courses.indexOf(course._id) > -1 &&
      user.courses.indexOf(course._id) === -1
    ) {
      history.push('/myVMT/courses');
    }
    // If we've just fetched the course?
    if (!prevProps.course && course) {
      this.checkAccess();
      this.displayNotifications();
    }

    if (
      prevProps.course &&
      prevProps.course.members.length !== course.members.length
    ) {
      this.checkAccess();
    }
    if (prevProps.notifications.length !== notifications.length) {
      // this.props.getCourse(this.props.match.params.course_id)
      this.displayNotifications();
    }
    // if the course has been updated by redux
    // This will happen when an update request is unsuccessful. When a user updates the course we are changing this components state
    // and updating the UI immediately, if the request fails we need to undo that state/ui change
    if (
      prevProps.loading.updateResource === null &&
      loading.updateResource === 'course'
    ) {
      // N.B., it is safe to setState here because we are in a condition
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        name: course.name,
        description: course.description,
        entryCode: course.entryCode,
        privacySetting: course.privacySetting,
      });
    }
    if (prevProps.user.inAdminMode !== user.inAdminMode) {
      // this would happen if admin toggled admin mode using the top bar
      this.checkAccess();
    }
    // if ((this.state.member || this.state.owner) && !this.props.loading) {
    //   this.checkForFetch();
    // }
    // if (prevProps.match.params.resource !== this.props.match.params.resource) {
    //   this.props.getUser(this.props.user._id)
    // }
  }

  requestAccess = () => {
    // consider getting requestAccess from mapDispatchToProps instead of patent component
    const { course, user, connectRequestAccess, history } = this.props;
    // HEY? WHY DO WE NEED COURSE.CREATOR RIGHT HERE
    connectRequestAccess(course.creator, user._id, 'courses', course._id);
    history.push('/confirmation');
  };

  requestPublicAccess = () => {
    const { connectGrantAccess, user, course } = this.props;
    connectGrantAccess(
      { _id: user._id, username: user.username },
      'courses',
      course._id
    );
  };

  displayNotifications = () => {
    // console.log(notifications)
    const { tabs } = this.state;
    const updatedTabs = [...tabs];
    const { course, notifications } = this.props;
    // if (course.creator === user._id
    if (course.myRole === 'facilitator') {
      const memberNtfs = notifications.filter(
        (ntf) =>
          ntf.resourceId === course._id &&
          (ntf.notificationType === 'requestAccess' ||
            ntf.notificationType === 'newMember')
      );
      updatedTabs[2].notifications =
        memberNtfs.length > 0 ? memberNtfs.length : '';
    }
    const newRoomNtfs = notifications.filter(
      (ntf) =>
        ntf.parentResource === course._id &&
        (ntf.notificationType === 'assignedNewRoom' ||
          ntf.notificationType === 'invitation' ||
          ntf.notificationType === 'newMember')
    );
    updatedTabs[1].notifications =
      newRoomNtfs.length > 0 ? newRoomNtfs.length : '';
    // }
    // if (notifications.llength > 0){
    //   tabs[1].notifications = notifications.llength;
    // }
    this.setState({ tabs: updatedTabs });
  };

  // checkForFetch = () => {
  //   const { course, user, match } = this.props;
  //   const resource = match.params.resource;
  //   const needToFetch = _difference(user[resource], this.props[resource]).length !== 0;
  //   if (needToFetch) {
  //     // @IDEA We could avoid this formatting if we dont use camel case like in the myVMT container
  //     let re = resource[0].toUpperCase() + resource.substr(1)
  //     this.props[`get${re}`](course[resource])
  //   }
  // }

  checkAccess = () => {
    const { course, user } = this.props;
    const { guestMode } = this.state;

    if (
      user.inAdminMode ||
      find(course.members, (member) => member.user._id === user._id)
    ) {
      this.setState({ guestMode: false, isAdmin: user.inAdminMode });
    } else if (!guestMode) {
      this.setState({ guestMode: true, isAdmin: false });
    }
  };

  toggleEdit = () => {
    const { course } = this.props;
    this.setState((prevState) => ({
      editing: !prevState.editing,
      name: course.name,
      privacySetting: course.privacySetting,
      entryCode: course.entryCode,
      instruction: course.instructions,
    }));
  };

  updateCourseInfo = (event, option) => {
    const { value, name } = event.target;
    this.setState({ [name]: option || value });
  };

  updateCourse = () => {
    const { connectUpdateCourse, course } = this.props;
    const {
      entryCode,
      name,
      details,
      description,
      privacySetting,
    } = this.state;
    const body = { entryCode, name, details, description, privacySetting };
    // only send the fields that have changed
    Object.keys(body).forEach((key) => {
      if (body[key] === course[key]) {
        delete body[key];
      }
    });
    connectUpdateCourse(course._id, body);
    this.setState({
      editing: false,
    });
  };

  clearFirstViewNtf = () => {
    this.setState({ firstView: false, invited: false });
    // Find the notifcation that corresponds to this course
    // let ntfId = this.props.user.notifications.filter(ntf => ntf.resourceId === this.props.match.params.course_id)
    // this.props.clearNotification(ntfId)
  };

  trashCourse = () => {
    this.setState({ trashing: true });
  };

  removeMeFromCourse = () => {
    const { course, connectRemoveCourseMember, user } = this.props;
    // This will cause compnentDidUpdate to fire. There we will check if the user still belongs to this course,
    // if they don;t, we'll redirect to myVMT
    connectRemoveCourseMember(course._id, user._id);
  };

  render() {
    const {
      course,
      user,
      match,
      notifications,
      loading,
      history,
      connectUpdateCourse,
      connectUpdateUser,
    } = this.props;
    const {
      guestMode,
      isAdmin,
      editing,
      privacySetting,
      entryCode,
      name,
      description,
      bothRoles,
      firstView,
      trashing,
      tabs,
      invited,
    } = this.state;
    if (course && !guestMode) {
      const { resource } = match.params;
      let myRooms;
      if (resource === 'rooms') {
        myRooms = course.rooms.filter((room) => {
          let included = false;
          room.members.forEach((member) => {
            if (member.user._id === user._id) included = true;
          });
          return included;
        });
      }
      // let contentData = {
      //   resource,
      //   parentResource: "courses",
      //   parentResourceId: course._id,
      //   userResources: ,
      //   notifications:  notifications.filter(ntf => ntf.resourceId === course._id) || [],
      //   userId: user._id, // @TODO <-- get rid of this user user object below
      //   user: user,
      //   owner: this.state.owner,
      // }

      let mainContent;
      if (resource === 'rooms' || resource === 'activities') {
        mainContent = (
          <ResourceList
            userResources={myRooms || course[resource] || []}
            user={user}
            resource={resource}
            notifications={notifications.filter(
              (ntf) => ntf.parentResource === course._id
            )}
            parentResource="courses"
            parentResourceId={course._id}
          />
        );
      } else if (resource === 'members') {
        mainContent = (
          <Members
            user={user}
            classList={course.members}
            owner={course.myRole === 'facilitator' || isAdmin}
            resourceType="course"
            resourceId={course._id}
            notifications={
              notifications.filter((ntf) => ntf.resourceId === course._id) || []
            }
          />
        );
      } else if (resource === 'preview')
        mainContent = <CourseMonitor course={course} />;
      // Updatekeys = the keys that we failed to update
      const { updateFail, updateKeys } = loading;

      const additionalDetails = {
        facilitators: course.members.filter(
          (member) => member.role === 'facilitator'
        ).length,
        activities: course.activities.length,
        rooms: course.rooms.length,
        privacy: (
          <Error
            error={updateFail && updateKeys.indexOf('privacySetting') > -1}
          >
            <EditText
              change={this.updateCourseInfo}
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

      if (course.myRole === 'facilitator') {
        additionalDetails.code = (
          <Error error={updateFail && updateKeys.indexOf('entryCode') > -1}>
            <EditText
              change={this.updateCourseInfo}
              inputType="text"
              name="entryCode"
              editing={editing}
            >
              {entryCode}
            </EditText>
          </Error>
        );
      }

      // @TODO MAYBE MOVE THESE MODAL INSTANCES OUTTA HERE TO COMPONENTS/UI
      return (
        <Aux>
          <DashboardLayout
            breadCrumbs={
              <BreadCrumbs
                crumbs={[
                  { title: 'My VMT', link: '/myVMT/courses' },
                  {
                    title: course.name,
                    link: `/myVMT/courses/${course._id}/rooms`,
                  },
                ]}
                notifications={user.notifications}
              />
            }
            sidePanel={
              <SidePanel
                image={course.image}
                alt={name}
                editing={editing}
                name={
                  <Error error={updateFail && updateKeys.indexOf('name') > -1}>
                    <EditText
                      change={this.updateCourseInfo}
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
                    error={updateFail && updateKeys.indexOf('description') > -1}
                  >
                    <EditText
                      change={this.updateCourseInfo}
                      inputType="text"
                      name="description"
                      editing={editing}
                    >
                      {description}
                    </EditText>
                  </Error>
                }
                owner={course.myRole === 'facilitator'}
                bothRoles={bothRoles}
                additionalDetails={additionalDetails}
                accountType={user.accountType}
                editButton={
                  course.myRole === 'facilitator' || isAdmin ? (
                    <Aux>
                      <div
                        role="button"
                        tabIndex="-2"
                        style={{
                          display: editing ? 'none' : 'block',
                        }}
                        data-testid="edit-course"
                        onClick={this.toggleEdit}
                        onKeyPress={this.toggleEdit}
                      >
                        <span>
                          Edit Course <i className="fas fa-edit" />
                        </span>
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
                            click={this.updateCourse}
                            data-testid="save-course"
                            theme="Small"
                          >
                            Save
                          </Button>
                          <Button
                            click={this.trashCourse}
                            data-testid="trash-course"
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
            tabs={<TabList routingInfo={match} tabs={tabs} />}
            mainContent={mainContent}
          />
          <Modal show={firstView} closeModal={this.clearFirstViewNtf}>
            <p>
              Welcome to {course.name}, {user.firstName}! Here you can connect
              with your Virtual Math Team.
            </p>
            <br />
            <Button theme="Small" click={this.clearFirstViewNtf}>
              Let&#39;s Go!
            </Button>
          </Modal>
          <Modal show={invited} closeModal={this.clearFirstViewNtf}>
            <p>
              Hey {user.firstName}- You have been invited to {course.name}. Here
              you can connect with your Virtual Math Team.
            </p>
            <br />
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Button
                data-testid="join"
                theme="Small"
                click={this.clearFirstViewNtf}
              >
                Join the Team
              </Button>
              {/* <Button
                data-testid="leave"
                theme="Small"
                click={this.removeMeFromCourse}
              >
                Leave
              </Button> */}
            </div>
          </Modal>
          {trashing ? (
            <TrashModal
              resource="course"
              resourceId={course._id}
              update={connectUpdateCourse}
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
    return (
      <Access
        closeModal={() => history.push('/community/courses?privacy=all')}
        resource="courses"
        resourceId={match.params.course_id}
        userId={user._id}
        username={user.username}
        privacySetting={course ? course.privacySetting : 'private'}
        owners={
          course
            ? course.members
                .filter((member) => member.role === 'facilitator')
                .map((member) => member.user)
            : []
        }
        setAdmin={() => {
          connectUpdateUser({
            inAdminMode: true,
          });

          this.setState({ isAdmin: true, guestMode: false });
        }}
      />
    );
  }
}

Course.propTypes = {
  course: PropTypes.shape({}),
  user: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})),
  history: PropTypes.shape({}).isRequired,
  loading: PropTypes.bool.isRequired,
  connectGrantAccess: PropTypes.func.isRequired,
  connectRequestAccess: PropTypes.func.isRequired,
  connectGetCourse: PropTypes.func.isRequired,
  connectClearNotification: PropTypes.func.isRequired,
  connectRemoveCourseMember: PropTypes.func.isRequired,
  connectUpdateCourse: PropTypes.func.isRequired,
  connectUpdateUser: PropTypes.func.isRequired,
};

Course.defaultProps = {
  course: null,
  notifications: null,
};

const mapStateToProps = (store, ownProps) => {
  // eslint-disable-next-line camelcase
  const { course_id } = ownProps.match.params;
  return {
    course: store.courses.byId[course_id]
      ? populateResource(store, 'courses', course_id, ['activities', 'rooms'])
      : null,
    activities: store.activities.allIds,
    rooms: store.rooms.allIds,
    user: store.user,
    // notifications: store.user.courseNotifications.access,
    notifications: getUserNotifications(store.user, null, 'course'),
    loading: store.loading.loading,
  };
};

export default connect(
  mapStateToProps,
  {
    connectClearNotification: clearNotification,
    connectRemoveCourseMember: removeCourseMember,
    connectUpdateCourse: updateCourse,
    connectGetCourse: getCourse,
    connectRequestAccess: requestAccess,
    connectGrantAccess: grantAccess,
    connectUpdateUser: updateUser,
  }
)(Course);
