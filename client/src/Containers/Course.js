import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash/find';
import { API, getUserNotifications } from 'utils';
import { CourseRooms } from 'Layout';
import CourseMonitor from './Monitoring/CourseMonitor';
import { populateResource } from '../store/reducers';
import Members from './Members/Members';

import {
  removeCourseMember,
  updateCourse,
  clearNotification,
  getCourse,
  requestAccess,
  grantAccess,
  updateUser,
  inviteToActivity,
  removeFromActivity,
  updateCourseMembers,
  updateRoomMembers,
  inviteToRoom,
} from '../store/actions';
import {
  DashboardLayout,
  SidePanel,
  DashboardContent,
} from '../Layout/Dashboard';
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
import CourseStats from './Stats/CourseStats';

class Course extends Component {
  constructor(props) {
    super(props);
    const { course } = this.props;
    this.state = {
      guestMode: true,
      tabs: [
        { name: 'Rooms' },
        { name: 'Members' },
        { name: 'Activities' },
        ...(course.myRole === 'facilitator' ? [{ name: 'Monitor' }] : []),
        { name: 'Stats' },
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
      errorMessage: '',
      admins: [],
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
        const fields = ['isAdmin', '_id', 'username'];
        API.getUsersByResource('courses', course._id, fields).then((res) => {
          if (res && res.data && res.data.result && res.data.result.length) {
            const admins = res.data.result.filter((user) => user.isAdmin);
            const adminIds = admins.map((admin) => admin._id);
            const classList = course.members;
            const adminsInCourse = classList.filter((member) =>
              adminIds.includes(member.user._id)
            );
            this.setState({ admins: adminsInCourse });
          } else {
            this.setState({ admins: [] });
          }
        });
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
    this.setState({ tabs: updatedTabs });
  };

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
      errorMessage: '',
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
    if (body.entryCode) {
      // basic validation for unique code
      API.getWithCode('courses', body.entryCode)
        .then((res) => {
          if (res.data.result.length > 0) {
            this.setState({ errorMessage: 'Invalid Entry Code!' });
          } else {
            connectUpdateCourse(course._id, body);
            this.setState({
              editing: false,
            });
            this.setState({ errorMessage: '' });
          }
        })
        .catch((err) => {
          this.setState({ errorMessage: err.response.data.errorMessage });
          // eslint-disable-next-line no-console
          console.log('API err: ', err);
        });
    } else {
      connectUpdateCourse(course._id, body);
      this.setState({
        editing: false,
      });
    }
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

  sortParticipants = (list) => {
    const facilitators = list
      .filter((mem) => mem.role === 'facilitator')
      .sort((a, b) => a.user.username.localeCompare(b.user.username));
    const prevParticipants = list.filter((mem) => mem.role === 'participant');
    const otherMembers = list.filter(
      (mem) => mem.role !== 'participant' && mem.role !== 'facilitator'
    );

    return prevParticipants
      .sort((a, b) => a.user.username.localeCompare(b.user.username))
      .concat(facilitators)
      .concat(otherMembers);
  };

  changeMemberRole = (updatedMember) => {
    const {
      course,
      connectInviteToActivity,
      connectRemoveFromActivity,
      connectUpdateCourseMembers,
      connectUpdateRoomMembers,
      connectInviteToRoom,
    } = this.props;

    const courseRoomsMembers = course.rooms.reduce(
      (_acc, room) => ({
        [room._id]: room.members,
      }),
      {}
    );

    const classList = this.sortParticipants(course.members);

    const takeAction =
      updatedMember.role === 'facilitator'
        ? connectInviteToActivity
        : connectRemoveFromActivity;
    course.activities.forEach(
      (activity) =>
        updatedMember.user && takeAction(activity._id, updatedMember.user._id)
    );

    // create a new classList containing the updatedMember (with a new role). Because we are
    // sending this to the db, reduce the user field down to just the _id
    const updatedClassList = classList.map((member) => {
      return member.user._id === updatedMember.user._id
        ? { ...updatedMember, user: updatedMember.user._id }
        : { ...member, user: member.user._id };
    });

    // If we are inside of a course, we have to update the course members' roles
    // If we are upgrading a member into a course facilitator, we must:
    // - check whether that course member is a member of each room in the course. For each room that they are a member of, change their role.
    //   For each room that they aren't a member of, invite them to that room (which adds them to the room list and adds the room to
    //   the user's list of rooms).
    // - invite that member to each template/activity in the course (which should add them to the activity user list and add
    //   the activity to the user's list of activities)
    // If we are downgrading a member into a course participant, we must:
    // - change that member to be a participant of each room in the course that they are a member of
    // - disinvite the user from all course template/activities:
    //   remove that member from the list of users who can access each template/activity and remove all course
    //   templates/activities from the user's list of templates/activities.

    connectUpdateCourseMembers(course._id, updatedClassList);

    if (courseRoomsMembers && updatedMember.role === 'facilitator') {
      // if the course has archived rooms
      // 1. add the user as a member to each archived room
      // 2. add each archived room to the member's user.archive.room
      if (
        course.archive &&
        course.archive.rooms &&
        course.archive.rooms.length
      ) {
        API.addMemberToArchivedRooms(updatedMember, course.archive.rooms);
      }

      Object.keys(courseRoomsMembers).forEach((roomId) => {
        if (
          courseRoomsMembers[roomId].find(
            (member) => member.user._id === updatedMember.user._id
          )
        ) {
          const updatedMemberList = courseRoomsMembers[roomId].map((member) => {
            if (member.user._id === updatedMember.user._id)
              member.role = 'facilitator';
            return member;
          });

          connectUpdateRoomMembers(roomId, updatedMemberList);
        } else
          connectInviteToRoom(
            roomId,
            updatedMember.user._id,
            updatedMember.user.username,
            undefined, // color
            updatedMember.role
          );
      });
    } else if (courseRoomsMembers && updatedMember.role === 'participant') {
      Object.keys(courseRoomsMembers).forEach((roomId) => {
        const updatedMemberList = courseRoomsMembers[roomId].map((member) => {
          if (member.user._id === updatedMember.user._id)
            member.role = 'participant';
          return member;
        });

        connectUpdateRoomMembers(roomId, updatedMemberList);
      });

      // change the role in the archived rooms
      // remove access from archived rooms
      if (
        course.archive &&
        course.archive.rooms &&
        course.archive.rooms.length
      ) {
        // API.removeMemberFromArchivedRooms(updatedMember, course.archive.`rooms);
      }
    }
    // if we are in the member list of a room, just update the room with the updated members array
  };

  statRooms = (course) => {
    const courseIds = course.rooms.map((room) => room._id);
    // const archivedIds = (user.archive && user.archive.rooms) || [];
    const courseArchived = (course.archive && course.archive.rooms) || [];
    return courseIds.concat(courseArchived);
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
      errorMessage,
      admins,
    } = this.state;
    if (course && !guestMode) {
      const { resource } = match.params;
      let mainContent;
      if (
        resource === 'rooms' &&
        (course.myRole === 'facilitator' || user.inAdminMode)
      ) {
        mainContent = <CourseRooms userId={user._id} course={course} />;
      } else if (resource === 'rooms' || resource === 'activities') {
        mainContent = (
          <DashboardContent
            userResources={course[resource] || []}
            user={user}
            resource={resource}
            notifications={notifications.filter(
              (ntf) => ntf.parentResource === course._id
            )}
            parentResource="courses"
            parentResourceId={course._id}
            parentCourseId={course._id}
            context="course"
            selectableBoxList
          />
        );
      } else if (resource === 'members') {
        mainContent = (
          <Members
            user={user}
            classList={this.sortParticipants(course.members)}
            courseMembers={course.members}
            admins={admins}
            owner={course.myRole === 'facilitator' || isAdmin}
            resourceType="course"
            resourceId={course._id}
            notifications={
              notifications.filter((ntf) => ntf.resourceId === course._id) || []
            }
            course={course}
            onChangeRole={this.changeMemberRole}
          />
        );
      } else if (resource === 'monitor') {
        mainContent = <CourseMonitor course={course} />;
      } else if (resource === 'stats')
        mainContent = (
          <CourseStats roomIds={this.statRooms(course)} name={course.name} />
        );
      // Updatekeys = the keys that we failed to update
      const { updateFail, updateKeys } = loading;

      const additionalDetails = {
        facilitators: course.members.filter(
          (member) => member.role === 'facilitator'
        ).length,
        participants: course.members.filter(
          (member) => member.role === 'participant'
        ).length,
        activities: course.activities.length,
        rooms: course.rooms.length,
        // ['archived rooms']: course.archive.rooms.length,
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
          <Error
            error={
              (updateFail && updateKeys.indexOf('entryCode') > -1) ||
              !!errorMessage // convert to boolean
            }
          >
            <EditText
              change={this.updateCourseInfo}
              inputType="text"
              name="entryCode"
              editing={editing}
            >
              {entryCode}
            </EditText>
            {errorMessage}
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
                          Edit Info <i className="fas fa-edit" />
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
                            p="5px 10px"
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
                          <Button
                            click={this.toggleEdit}
                            theme="Cancel"
                            p="5px 10px"
                          >
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
        privacySetting={(course && course.privacySetting) || 'private'}
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
  course: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    myRole: PropTypes.string,
    instructions: PropTypes.string,
    entryCode: PropTypes.string,
    members: PropTypes.arrayOf(PropTypes.shape({})),
    rooms: PropTypes.arrayOf(PropTypes.shape({})),
    activities: PropTypes.arrayOf(PropTypes.shape({})),
    privacySetting: PropTypes.string,
    creator: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    image: PropTypes.string,
    archive: PropTypes.shape({ rooms: PropTypes.arrayOf(PropTypes.string) }),
  }),
  user: PropTypes.shape({
    rooms: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]) // This type represents that the values might be the _id or the populated object
    ),
    courses: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})])
    ),
    notifications: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})])
    ),
    inAdminMode: PropTypes.bool,
    _id: PropTypes.string,
    username: PropTypes.string,
    accountType: PropTypes.string,
    firstName: PropTypes.string,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      course_id: PropTypes.string,
      resource: PropTypes.string,
    }),
  }).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})),
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  loading: PropTypes.bool.isRequired,
  connectGrantAccess: PropTypes.func.isRequired,
  connectRequestAccess: PropTypes.func.isRequired,
  connectGetCourse: PropTypes.func.isRequired,
  connectClearNotification: PropTypes.func.isRequired,
  connectRemoveCourseMember: PropTypes.func.isRequired,
  connectUpdateCourse: PropTypes.func.isRequired,
  connectUpdateUser: PropTypes.func.isRequired,
  connectInviteToActivity: PropTypes.func.isRequired,
  connectRemoveFromActivity: PropTypes.func.isRequired,
  connectUpdateCourseMembers: PropTypes.func.isRequired,
  connectUpdateRoomMembers: PropTypes.func.isRequired,
  connectInviteToRoom: PropTypes.func.isRequired,
};

Course.defaultProps = {
  course: null,
  notifications: null,
};

const mapStateToProps = (store, ownProps) => {
  const { course_id } = ownProps.match.params;
  const localCourse = store.courses.byId[course_id]
    ? populateResource(store, 'courses', course_id, ['activities', 'rooms'])
    : null;

  // If the user is an admin, withPopulatedCourse will have placed the course in the redux store from the db.
  return {
    course: localCourse ||
      localCourse || {
        _id: course_id,
        rooms: [],
        activities: [],
        members: [],
      },
    activities: store.activities.allIds, // @TODO: Note that this prop is never used. It is all activities user has access to.
    rooms: store.rooms.allIds,
    user: store.user,
    // notifications: store.user.courseNotifications.access,
    notifications: getUserNotifications(store.user, null, 'course'),
    loading: store.loading.loading,
  };
};

export default connect(mapStateToProps, {
  connectClearNotification: clearNotification,
  connectRemoveCourseMember: removeCourseMember,
  connectUpdateCourse: updateCourse,
  connectGetCourse: getCourse,
  connectRequestAccess: requestAccess,
  connectGrantAccess: grantAccess,
  connectUpdateUser: updateUser,
  connectInviteToActivity: inviteToActivity,
  connectInviteToRoom: inviteToRoom,
  connectUpdateCourseMembers: updateCourseMembers,
  connectUpdateRoomMembers: updateRoomMembers,
  connectRemoveFromActivity: removeFromActivity,
})(Course);
