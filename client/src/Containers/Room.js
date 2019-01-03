import React, { Component } from 'react';
import moment from 'moment'
import { connect } from 'react-redux';
import { DashboardLayout, SidePanel, RoomDetails, } from '../Layout/Dashboard/';
import Members from './Members/Members';
import { getUserNotifications } from '../utils/notifications';
import {
  enterRoomWithCode,
  populateRoom,
  requestAccess,
  clearError,
  clearNotification,
  updateRoom,
  getRoom,
} from '../store/actions';
import {
  Aux,
  Modal,
  Button,
  BreadCrumbs,
  TabList,
  EditText,
  TrashModal,
} from '../Components';
import Access from './Access';
// import PublicAccessModal from '../Components/UI/Modal/PublicAccess'
// import Participants from './Participants/Participants';
class Room extends Component {
  state = {
    owner: false,
    member: false,
    guestMode: true,
    tabs: [
      {name: 'Details'},
      {name: 'Members'},
    ],
    firstView: false,
    editing: false,
    dueDate: this.props.room ? this.props.room.dueDate : null,
    name: this.props.room ? this.props.room.name : null,
    description: this.props.room ? this.props.room.description : null,
    entryCode: this.props.room ? this.props.room.entryCode : null,
    instructions: this.props.room ? this.props.room.instructions : null,
    privacySetting: this.props.room ? this.props.room.privacySetting : null,
    trashing: false,

  }

  initialTabs = [
    {name: 'Details'},
    {name: 'Members'},
  ]

  componentDidMount() {
    const { room, user, clearNotification, } = this.props;
    let notifications = user.notifications;
    // UPDATE ROOM ANYTIME WE'RE HERE SO WE'RE GUARANTEED TO HAVE THE FRESHEST DATA
    // If its in the store check access
    if (room) {
      // populateRoom(match.params.room_id) // @TODO IF we do get rid of this we probably have unnecessary updates in componentDidUpdate
      // check access
      let updatedTabs = [...this.state.tabs];
      let owner = false;
      let firstView = false;
      if (room.members.filter(member => member.role === 'facilitator' && member.user._id === user._id).length > 0) { // WE SHOULD ACTUALLY BE CHECKING THE FACILITATORS NOT THE OWNER
        // updatedTabs = updatedTabs.concat([{name: 'Grades'}, {name: 'Insights'}]);
        // this.initialTabs.concat([{name: 'Grades'}, {name: 'Insights'}])
        owner = true;
        // displayNotifications
        updatedTabs = this.displayNotifications(updatedTabs)
      }
      if (notifications.length > 0) {
        notifications.forEach(ntf => {
          if (ntf.notificationType === 'grantedAccess' && ntf.resourceId === room._id) {
            // RESOLVE THIS NOTIFICATION
            firstView = true;
            clearNotification(ntf._id); //CONSIDER DOING THIS AND MATCHING ONE IN ROOM.js IN REDUX ACTION
          } else if (ntf.notificationType === 'assignedNewRoom' && ntf.resourceId === room._id) {
            firstView = true;
            clearNotification(ntf._id)
          }
        })
      }
      if (room.members) {
        this.checkAccess();
      }
      this.setState({
        tabs: updatedTabs,
        owner,
        firstView,
      })

    }
    // else fetch it
    else {
      // populateRoom(match.params.room_id) // @TODO WE DONT ACTUALLY WANT TO POPULATE IT HERE...THAT GIVES US ALL THE EVENTS..WE JUST WANT TO GET THE MEMBERS SO WE CAN CHECK ACCESS
      this.fetchRoom();
    }

  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.room) {
      return;
    }
    // If we just fetched the room now check access
    if (!prevProps.room && this.props.room) {
      this.checkAccess();
    }
    // THESE ARE SUSCEPTIBLE TO ERRORS BECAUSE YOU COULD GAIN AND LOSE TWO DIFFERENT NTFS IN A SINGLE UPDATE POTENTIALLY? ACTUALLY COULD YOU?
    if (prevProps.room && this.props.room && prevProps.room.members.length !== this.props.room.members.length) {
      this.checkAccess();
    }
    if (prevProps.notifications.length !== this.props.notifications.length) {
      let updatedTabs = this.displayNotifications([...this.state.tabs]);
      this.setState({tabs: updatedTabs})
    }
  }

  checkAccess () {
    if (this.props.room.members.find(member => member.user._id === this.props.user._id)) {
      this.setState({member: true, guestMode: false})
    };
  }

  enterWithCode = entryCode => {
    let {room, user} = this.props;
    this.props.enterRoomWithCode(room._id, entryCode, user._id, user.username)
  }

  displayNotifications = (tabs) => {
    let { user, room, notifications } = this.props;
    if (room.members.filter(member => member.role === 'facilitator' && member.user._id === user._id).length > 0) {
      let thisRoomsNtfs = notifications.filter(ntf => ntf.resourceId === room._id)
      tabs[1].notifications = thisRoomsNtfs.length > 0 ? thisRoomsNtfs.length: '';
    }
    return tabs;
  }

  toggleEdit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing,
      name: this.props.room.name,
      dueDate: this.props.room.dueDate,
      privacySetting: this.props.room.privacySetting,
      entryCode: this.props.room.entryCode,
      description: this.props.room.description,
      instructions: this.props.room.instructions,
    }))
  }
  // options is for radioButton/checkbox inputs
  updateRoomInfo = (event, option) => {
    let { value, name } = event.target;
    this.setState({[name]: option || value})
  }

  updateRoom = () => {
    let { updateRoom, room, } = this.props;
    let { dueDate, entryCode, name, instructions, details, description, privacySetting } = this.state
    let body = {entryCode, name, dueDate, details, instructions, description, privacySetting }
    updateRoom(room._id, body)
    this.setState({
      editing: false,
    })
  }

  goToWorkspace = () => {
    this.props.history.push(`/myVMT/workspace/${this.props.room._id}`);
  }

  goToReplayer = () => {
    this.props.history.push(`/myVMT/workspace/${this.props.room._id}/replayer`)
  }

  fetchRoom = () => {
    this.props.getRoom(this.props.match.params.room_id);
  }

  trashRoom = () => {
    this.setState({trashing: true})
  }
  render() {
    let {
      room, match, user,
      notifications, error,
      clearError, course
    } = this.props;
    if (room && !this.state.guestMode) {
      // ESLINT thinks this is unnecessary but we use the keys directly in the dom and we want them to have spaces
      let dueDateText = 'Due Date' // the fact that we have to do this make this not worth it
      let ggb = false;
      let desmos = false;
      room.tabs.forEach((tab) => {
        if (tab.tabType === 'geogebra') ggb = true;
        else if (tab.tabType === 'desmos') desmos = true;
      })
      let roomType;
      if (ggb && desmos) roomType = 'Geogebra/Desmos'
      else roomType = ggb ? 'Geogebra' : 'Desmos';

      let additionalDetails = {
        [dueDateText]: <EditText change={this.updateRoomInfo} inputType='date' editing={this.state.editing} name='dueDate'>{this.state.dueDate}</EditText>,
        type: roomType,
        privacy: <EditText change={this.updateRoomInfo} inputType='radio' editing={this.state.editing} options={['public', 'private']} name='privacySetting'>{this.state.privacySetting}</EditText>,
        facilitators: room.members.reduce((acc, member) => {
          if (member.role === 'facilitator') acc += `${member.user.username} `
          return acc;
        }, '')
      }

      if (this.state.owner) {
        additionalDetails.code = <EditText change={this.updateRoomInfo} inputType='text' name='entryCode' editing={this.state.editing}>{this.state.entryCode}</EditText>;
      }

      let crumbs = [
        {title: 'My VMT', link: '/myVMT/courses'},
        {title: room.name, link: `/myVMT/rooms/${room._id}/details`}]
        //@TODO DONT GET THE COURSE NAME FROM THE ROOM...WE HAVE TO WAIT FOR THAT DATA JUST GRAB IT FROM
        // THE REDUX STORE USING THE COURSE ID IN THE URL
      if (course) {crumbs.splice(1, 0, {title: course.name, link: `/myVMT/courses/${course._id}/activities`})}
      let mainContent;
      if (this.props.match.params.resource === 'details') {
        mainContent = <RoomDetails
          room={room}
          owner={this.state.owner}
          notifications={notifications.filter(ntf => ntf.resourceId === room._id) || []}
          editing={this.state.editing}
          toggleEdit={this.toggleEdit}
          updateRoomInfo={this.updateRoomInfo}
          instructions={this.state.instructions}
        />
      } else if (this.props.match.params.resource === 'members') {
        mainContent = <Members
          user={user}
          classList={room.members}
          owner={this.state.owner}
          resourceType={'room'}
          resourceId={room._id}
          courseMembers={course ? course.members : null}
          notifications={notifications.filter(ntf => ntf.resourceId === room._id) || []}
        />
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
                alt={this.state.name}
                name={<EditText change={this.updateRoomInfo} inputType='title' name='name' editing={this.state.editing}>{this.state.name}</EditText>}
                subTitle={<EditText change={this.updateRoomInfo} inputType='text' name='description' editing={this.state.editing}>{this.state.description}</EditText>}
                owner={this.state.owner}
                additionalDetails={additionalDetails}
                buttons={
                  <Aux>
                    <span><Button theme={this.props.loading ? 'SmallCancel' : 'Small'} m={10} click={!this.props.loading ? this.goToWorkspace : () => null}>Enter</Button></span>
                    <span><Button theme={(this.props.loading) ? 'SmallCancel' : 'Small'} m={10} click={!this.props.loading ? this.goToReplayer : () => null}>Replayer</Button></span>
                  </Aux>
                }
                editButton={ this.state.owner
                  ? <Aux>
                      <div role='button' style={{display: this.state.editing ? 'none' : 'block'}} data-testid="edit-room" onClick={this.toggleEdit}>Edit Room <i className="fas fa-edit"></i></div>
                      {this.state.editing
                        ? <div>
                            <Button click={this.updateRoom} theme='edit-save'>Save</Button>
                            <Button click={this.trashRoom} data-testid='trash-room' theme='Danger'><i className="fas fa-trash-alt"></i></Button>
                            <Button click={this.toggleEdit} theme='edit'>Cancel</Button>
                          </div>
                        : null
                      }
                    </Aux>
                  : null
                }
              />
            }
            mainContent={mainContent}
            tabs={<TabList routingInfo={this.props.match} tabs={this.state.tabs} />}
          />
          {this.state.firstView
            ? <Modal show={this.state.firstView} close={() => this.setState({firstView: false })} history={this.props.history}>
            <p>Welcome to {room.name}. If this is your first time joining a room,
            we recommend you take a tour. Otherwise you can start exploring this room's features.</p>
            <Button data-testid='explore-room' click={() => this.setState({firstView: false})}>Explore</Button>
          </Modal> : null}
          {this.state.trashing
            ? <TrashModal
              resource='room'
              resourceId={room._id}
              update={this.props.updateRoom}
              show={this.state.trashing}
              closeModal={() => {this.setState({trashing: false})}}
              history={this.props.history}
              />
            : null
          }
        </Aux>
      )
    } else return (
      <Access
        resource='rooms'
        resourceId={match.params.room_id}
        userId={user._id}
        username={user.username}
        owners={room ? room.members.filter(member => member.role.toLowerCase() === 'facilitator').map(member => member.user._id) : []}
        error={error}
        clearError={clearError}
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  let { room_id, course_id } = ownProps.match.params;
  return {
    room: state.rooms.byId[room_id],
    course: state.courses.byId[course_id] || null,
    // courseMembers:  store.rooms.byId[room_id].course ? store.courses.byId[store.rooms.byId[room_id].course._id].members : null,// ONLY IF THIS ROOM BELONGS TO A COURSE
    user: state.user,
    notifications: getUserNotifications(state.user, null, 'room'), // this seems redundant
    loading: state.loading.loading,
    error: state.loading.errorMessage,
  }
}

export default connect(mapStateToProps, {enterRoomWithCode, populateRoom, requestAccess, clearError, clearNotification, updateRoom, getRoom})(Room);
