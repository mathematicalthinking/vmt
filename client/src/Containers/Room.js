/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  DashboardLayout,
  SidePanel,
  RoomDetails,
  RoomSettings,
} from '../Layout/Dashboard';
import Members from './Members/Members';
import Stats from './Stats/Stats';
import withPopulatedRoom from './Data/withPopulatedRoom';
import getUserNotifications from '../utils/notifications';
import {
  joinWithCode,
  requestAccess,
  clearError,
  clearNotification,
  updateRoom,
  getRoom,
  populateRoom,
  removeRoomMember,
  clearLoadingInfo,
  // populateRoom
} from '../store/actions';
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

class Room extends Component {
  initialTabs = [{ name: 'Details' }, { name: 'Members' }];
  constructor(props) {
    super(props);
    const { room } = this.props;
    this.state = {
      // member: false,
      guestMode: true,
      tabs: [
        { name: 'Details' },
        { name: 'Members' },
        { name: 'Stats' },
        { name: 'Settings' },
      ],
      firstView: false,
      editing: false,
      invited: false,
      dueDate: room ? room.dueDate : null,
      name: room ? room.name : null,
      description: room ? room.description : null,
      entryCode: room ? room.entryCode : null,
      instructions: room ? room.instructions : null,
      privacySetting: room ? room.privacySetting : null,
      trashing: false,
      isAdmin: false,
    };
  }

  componentDidMount() {
    const { room, user, connectClearNotification } = this.props;
    const { tabs } = this.state;
    // this.props.populateRoom(room._id, { events: t rue });
    const { notifications } = user;
    // UPDATE ROOM ANYTIME WE'RE HERE SO WE'RE GUARANTEED TO HAVE THE FRESHEST DATA
    // If its in the store check access
    if (room) {
      // check access
      let updatedTabs = [...tabs];
      const owner = false;
      let firstView = false;
      let invited = false;
      if (room.myRole === 'facilitator') {
        updatedTabs = this.displayNotifications(updatedTabs);
      }
      if (notifications.length > 0) {
        notifications.forEach((ntf) => {
          if (ntf.resourceId === room._id) {
            if (
              ntf.notificationType === 'grantedAccess' ||
              ntf.notificationType === 'assignedNewRoom'
            ) {
              firstView = true;
              connectClearNotification(ntf._id);
            } else if (ntf.notificationType === 'invitation') {
              invited = true;
              connectClearNotification(ntf._id);
            }
          }
        });
      }
      if (room.members) {
        this.checkAccess();
      }
      this.setState({
        tabs: updatedTabs,
        owner,
        firstView,
        invited,
      });
    } else {
      this.fetchRoom();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      room,
      user,
      connectPopulateRoom,
      connectClearLoadingInfo,
      history,
      loading,
      notifications,
    } = this.props;
    const { tabs, isAdmin } = this.state;
    if (!room) {
      return;
    }
    if (
      prevProps.user.rooms.indexOf(room._id) > -1 &&
      user.rooms.indexOf(room._id) === -1
    ) {
      history.push('/myVMT/rooms');
    }
    // If we just fetched the room now check access
    if (!prevProps.room && room) {
      this.checkAccess();
    }
    if (
      prevProps.room &&
      room &&
      prevProps.room.members.length !== room.members.length
    ) {
      this.checkAccess();
    }
    // THESE ARE SUSCEPTIBLE TO ERRORS BECAUSE YOU COULD GAIN AND LOSE TWO DIFFERENT NTFS IN A SINGLE UPDATE POTENTIALLY? ACTUALLY COULD YOU?
    if (prevProps.notifications.length !== notifications.length) {
      const updatedTabs = this.displayNotifications([...tabs]);
      this.setState({ tabs: updatedTabs });
    }

    if (!prevState.isAdmin && isAdmin) {
      connectPopulateRoom(room._id);
    }
    if (
      prevProps.loading.updateResource === null &&
      loading.updateResource === 'room'
    ) {
      setTimeout(() => {
        // @TODO need to clean this up in cwum
        connectClearLoadingInfo();
      }, 2000);
      this.setState({
        name: room.name,
        description: room.description,
        entryCode: room.entryCode,
        privacySetting: room.privacySetting,
        instructions: room.instructions,
        dueDate: room.dueDate,
      });
    }
  }

  enterWithCode = (entryCode) => {
    const { room, user, connectJoinWithCode } = this.props;
    connectJoinWithCode(room._id, entryCode, user._id, user.username);
  };

  displayNotifications = (tabs) => {
    const { user, room, notifications } = this.props;
    if (
      room.members.filter(
        (member) =>
          member.role === 'facilitator' && member.user._id === user._id
      ).length > 0
    ) {
      const thisRoomsNtfs = notifications.filter(
        (ntf) => ntf.resourceId === room._id
      );
      tabs[1].notifications =
        thisRoomsNtfs.length > 0 ? thisRoomsNtfs.length : '';
    }
    return tabs;
  };

  toggleEdit = () => {
    const { room } = this.props;
    this.setState((prevState) => ({
      editing: !prevState.editing,
      name: room.name,
      dueDate: room.dueDate,
      privacySetting: room.privacySetting,
      entryCode: room.entryCode,
      description: room.description,
      instructions: room.instructions,
    }));
  };
  // options is for radioButton/checkbox inputs
  updateRoomInfo = (event, option) => {
    const { value, name } = event.target;
    this.setState({ [name]: option || value });
  };

  updateRoom = () => {
    const { connectUpdateRoom, room } = this.props;
    const {
      dueDate,
      entryCode,
      name,
      instructions,
      details,
      description,
      privacySetting,
    } = this.state;
    const body = {
      entryCode,
      name,
      dueDate,
      details,
      instructions,
      description,
      privacySetting,
    };
    // only send the fields that have changed
    Object.keys(body).forEach((key) => {
      if (body[key] === room[key]) {
        delete body[key];
      }
    });
    connectUpdateRoom(room._id, body);
    this.setState({
      editing: false,
    });
  };

  goToWorkspace = () => {
    const { user, history, room } = this.props;
    if (user.isAdmin) {
      // display a modal
    }
    history.push(`/myVMT/workspace/${room._id}`);
  };

  goToReplayer = () => {
    const { history, room } = this.props;
    history.push(`/myVMT/workspace/${room._id}/replayer`);
  };

  fetchRoom = () => {
    const { connectGetRoom, match } = this.props;
    connectGetRoom(match.params.room_id);
  };

  trashRoom = () => {
    this.setState({ trashing: true });
  };

  clearFirstViewModal = () => {
    this.setState({ firstView: false, invited: false });
  };

  removeMeFromRoom = () => {
    const { connectRemoveRoomMember, room, user } = this.props;
    // This will cause compnentDidUpdate to fire. There we will check if the user still belongs to this course,
    // if they don;t, we'll redirect to myVMT
    connectRemoveRoomMember(room._id, user._id);
  };

  checkAccess() {
    const { room, user, connectPopulateRoom } = this.props;
    if (room.members.find((member) => member.user._id === user._id)) {
      // if the room hasnt been populated yet...populate it
      if (!room.tabs) {
        connectPopulateRoom(room._id);
      }
      this.setState({ guestMode: false });
    }
  }

  render() {
    const {
      room,
      match,
      user,
      notifications,
      loading,
      history,
      error,
      connectClearError,
      connectUpdateRoom,
      course,
    } = this.props;
    const {
      guestMode,
      editing,
      dueDate,
      description,
      privacySetting,
      entryCode,
      instructions,
      owner,
      invited,
      isAdmin,
      tabs,
      firstView,
      name,
      trashing,
    } = this.state;
    if (room && room.tabs && !guestMode) {
      // ESLINT thinks this is unnecessary but we use the keys directly in the dom and we want them to have spaces
      const dueDateText = 'Due Date'; // the fact that we have to do this make this not worth it
      let ggb = false;
      let desmos = false;
      room.tabs.forEach((tab) => {
        if (tab.tabType === 'geogebra') ggb = true;
        else if (tab.tabType === 'desmos') desmos = true;
      });
      let roomType;
      if (ggb && desmos) roomType = 'GeoGebra/Desmos';
      else roomType = ggb ? 'GeoGebra' : 'Desmos';

      const { updateFail, updateKeys } = loading;

      const additionalDetails = {
        [dueDateText]: (
          <Error error={updateFail && updateKeys.indexOf('dueDate') > -1}>
            <EditText
              change={this.updateRoomInfo}
              inputType="date"
              editing={editing}
              name="dueDate"
            >
              {dueDate || 'Not Set'}
            </EditText>
          </Error>
        ),
        type: roomType,
        privacy: (
          <Error
            error={updateFail && updateKeys.indexOf('privacySetting') > -1}
          >
            <EditText
              change={this.updateRoomInfo}
              inputType="radio"
              editing={editing}
              options={['public', 'private']}
              name="privacySetting"
            >
              {privacySetting}
            </EditText>
          </Error>
        ),
        facilitators: room.members.reduce((acc, member) => {
          if (member.role === 'facilitator') acc += `${member.user.username} `;
          return acc;
        }, ''),
      };

      if (room.myRole === 'facilitator') {
        additionalDetails.code = (
          <Error error={updateFail && updateKeys.indexOf('entryCode') > -1}>
            <EditText
              change={this.updateRoomInfo}
              inputType="text"
              name="entryCode"
              editing={editing}
            >
              {entryCode || 'Not Set'}
            </EditText>
          </Error>
        );
      }

      const crumbs = [
        { title: 'My VMT', link: '/myVMT/rooms' },
        { title: room.name, link: `/myVMT/rooms/${room._id}/details` },
      ];
      // @TODO DONT GET THE COURSE NAME FROM THE ROOM...WE HAVE TO WAIT FOR THAT DATA JUST GRAB IT FROM
      // THE REDUX STORE USING THE COURSE ID IN THE URL
      if (course) {
        crumbs.splice(1, 0, {
          title: course.name,
          link: `/myVMT/courses/${course._id}/activities`,
        });
      }
      let mainContent;
      const { resource } = match.params;
      if (resource === 'details') {
        mainContent = (
          <RoomDetails
            room={room}
            owner={room.myRole === 'facilitator'}
            notifications={
              notifications.filter((ntf) => ntf.resourceId === room._id) || []
            }
            editing={editing}
            toggleEdit={this.toggleEdit}
            updateRoomInfo={this.updateRoomInfo}
            instructions={instructions}
            loading={loading}
          />
        );
      } else if (resource === 'members') {
        mainContent = (
          <Members
            user={user}
            classList={room.members}
            owner={room.myRole === 'facilitator' || isAdmin}
            resourceType="room"
            resourceId={room._id}
            parentResource={course ? course._id : null}
            courseMembers={course ? course.members : null}
            notifications={
              notifications.filter((ntf) => ntf.resourceId === room._id) || []
            }
          />
        );
      } else if (resource === 'settings') {
        mainContent = (
          <RoomSettings
            owner={owner}
            settings={room.settings}
            updateRoom={connectUpdateRoom}
            roomId={room._id}
          />
        );
      } else if (resource === 'stats') {
        const MainContent = withRouter(withPopulatedRoom(Stats));
        mainContent = <MainContent />;
      }
      return (
        <Aux>
          <DashboardLayout
            breadCrumbs={
              <BreadCrumbs crumbs={crumbs} notifications={user.notifications} />
            }
            sidePanel={
              <SidePanel
                image={room.image}
                alt={name}
                editing={editing}
                name={
                  <Error error={updateFail && updateKeys.indexOf('name') > -1}>
                    <EditText
                      change={this.updateRoomInfo}
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
                      change={this.updateRoomInfo}
                      inputType="text"
                      name="description"
                      editing={editing}
                    >
                      {description}
                    </EditText>
                  </Error>
                }
                owner={room.myRole === 'facilitator'}
                additionalDetails={additionalDetails}
                buttons={
                  <Aux>
                    <span>
                      <Button
                        theme={loading.loading ? 'SmallCancel' : 'Small'}
                        m={10}
                        data-testid="Enter"
                        click={!loading.loading ? this.goToWorkspace : null}
                      >
                        Enter
                      </Button>
                    </span>
                    <span>
                      <Button
                        theme={loading.loading ? 'SmallCancel' : 'Small'}
                        m={10}
                        data-testid="Replayer"
                        click={!loading.loading ? this.goToReplayer : null}
                      >
                        Replayer
                      </Button>
                    </span>
                  </Aux>
                }
                editButton={
                  room.myRole === 'facilitator' || isAdmin ? (
                    <Aux>
                      <div
                        role="button"
                        style={{
                          display: editing ? 'none' : 'block',
                        }}
                        data-testid="edit-room"
                        onClick={this.toggleEdit}
                        onKeyPress={this.toggleEdit}
                        tabIndex="-1"
                      >
                        Edit Room <i className="fas fa-edit" />
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
                            click={this.updateRoom}
                            data-testid="save-room"
                            theme="Small"
                          >
                            Save
                          </Button>
                          <Button
                            click={this.trashRoom}
                            data-testid="trash-room"
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
          {firstView ? (
            <Modal
              show={firstView}
              closeModal={this.clearFirstViewModal}
              history={history}
            >
              <p>
                Welcome to {room.name}. If this is your first time joining a
                room, we recommend you take a tour. Otherwise you can start
                exploring this room&#39;s features.
              </p>
              <Button
                data-testid="explore-room"
                click={() => this.setState({ firstView: false })}
              >
                Explore
              </Button>
            </Modal>
          ) : null}
          <Modal show={invited} closeModal={this.clearFirstViewModal}>
            <p>
              You have been invited to {room.name}. If you think you&#39;ve been
              added to this course in error you can click &#34;leave&#34; and
              you will be removed.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Button
                data-testid="join"
                theme="Small"
                click={this.clearFirstViewModal}
              >
                Join
              </Button>
              <Button
                data-testid="leave"
                theme="Small"
                click={this.removeMeFromRoom}
              >
                Leave
              </Button>
            </div>
          </Modal>
          {trashing ? (
            <TrashModal
              resource="room"
              resourceId={room._id}
              update={connectUpdateRoom}
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
    if (!room) return <div>Loading</div>;
    return (
      <Access
        closeModal={history.goBack}
        resource="rooms"
        resourceId={match.params.room_id}
        userId={user._id}
        username={user.username}
        privacySetting={room ? room.privacySetting : 'private'}
        owners={
          room && room.members
            ? room.members
                .filter((member) => member.role.toLowerCase() === 'facilitator')
                .map((member) => member.user)
            : []
        }
        error={error}
        clearError={connectClearError}
        setAdmin={() => {
          this.setState({ isAdmin: true, guestMode: false });
        }}
      />
    );
  }
}

Room.propTypes = {
  room: PropTypes.shape({}),
  user: PropTypes.shape({}).isRequired,
  course: PropTypes.shape({}),
  history: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
  loading: PropTypes.bool.isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  error: PropTypes.string,
  connectJoinWithCode: PropTypes.func.isRequired,
  // connectRequestAccess: PropTypes.func.isRequired,
  connectClearError: PropTypes.func.isRequired,
  connectClearNotification: PropTypes.func.isRequired,
  connectUpdateRoom: PropTypes.func.isRequired,
  connectGetRoom: PropTypes.func.isRequired,
  connectRemoveRoomMember: PropTypes.func.isRequired,
  connectClearLoadingInfo: PropTypes.func.isRequired,
  connectPopulateRoom: PropTypes.func.isRequired,
};

Room.defaultProps = {
  room: null,
  course: null,
  error: null,
};
const mapStateToProps = (state, ownProps) => {
  // eslint-disable-next-line camelcase
  const { room_id, course_id } = ownProps.match.params;
  return {
    room: state.rooms.byId[room_id],
    course: state.courses.byId[course_id] || null,
    // courseMembers:  store.rooms.byId[room_id].course ? store.courses.byId[store.rooms.byId[room_id].course._id].members : null,// ONLY IF THIS ROOM BELONGS TO A COURSE
    user: state.user,
    notifications: getUserNotifications(state.user, null, 'room'), // this seems redundant
    loading: state.loading.loading,
  };
};

export default connect(
  mapStateToProps,
  {
    connectJoinWithCode: joinWithCode,
    connectRequestAccess: requestAccess,
    connectClearError: clearError,
    connectClearNotification: clearNotification,
    connectUpdateRoom: updateRoom,
    connectGetRoom: getRoom,
    connectRemoveRoomMember: removeRoomMember,
    connectClearLoadingInfo: clearLoadingInfo,
    connectPopulateRoom: populateRoom,
  }
)(Room);
