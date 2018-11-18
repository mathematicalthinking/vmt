import React, { Component } from 'react';
import { connect } from 'react-redux';
import { enterRoomWithCode, populateRoom, requestAccess, clearError, clearNotification} from '../store/actions';
import moment from 'moment'
import DashboardLayout from '../Layout/Dashboard/Dashboard';
import Aux from '../Components/HOC/Auxil';
import Modal from '../Components/UI/Modal/Modal';
import Button from '../Components/UI/Button/Button';
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
  }

  initialTabs = [
    {name: 'Details'},
    {name: 'Members'},
  ]

  componentDidMount() {
    const { room, user, populateRoom, accessNotifications, clearNotification, match } = this.props;
    // UPDATE ROOM ANYTIME WE'RE HERE SO WE'RE GUARANTEED TO HAVE THE FRESHEST DATA
    // If its in the store check access
    if (room) {
      populateRoom(match.params.room_id)
      // CHECK ACCESS
      let updatedTabs = [...this.state.tabs];
      let owner = false;
      let firstView = false;
      if (room.creator === user._id) {
        // updatedTabs = updatedTabs.concat([{name: 'Grades'}, {name: 'Insights'}]);
        // this.initialTabs.concat([{name: 'Grades'}, {name: 'Insights'}])
        owner = true;
        // displayNotifications
        updatedTabs = this.displayNotifications(updatedTabs)
      }
      if (accessNotifications.length > 0) {
        accessNotifications.forEach(ntf => {
          if (ntf.notificationType === 'grantedAccess' && ntf._id === room._id) {
             // RESOLVE THIS NOTIFICATION
             firstView = true;
             clearNotification(room._id, user._id, null, 'rooms', 'access', ntf.notificationType) //CONSIDER DOING THIS AND MATCHING ONE IN ROOM.js IN REDUX ACTION
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
      populateRoom(match.params.room_id) // @TODO WE DONT ACTUALLY WANT TO POPULATE IT HERE...THAT GIVES US ALL THE EVENTS..WE JUST WANT TO GET THE MEMBERS SO WE CAN CHECK ACCESS
    }

  }

  componentDidUpdate(prevProps, prevState) {
    // If we just fetched the room now check access
    if (!prevProps.room && this.props.room) {
      this.checkAccess();
    }
    // THESE ARE SUSCEPTIBLE TO ERRORS BECAUSE YOU COULD GAIN AND LOSE TWO DIFFERENT NTFS IN A SINGLE UPDATE POTENTIALLY? ACTUALLY COULD YOU?
    if (prevProps.room && prevProps.room.members.length !== this.props.room.members.length) {
      this.checkAccess();
    }
    if (prevProps.accessNotifications.length !== this.props.accessNotifications.length) {
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
    let { user, room } = this.props;
    let { roomNotifications } = user;
    if (room.creator === user._id) {
      let thisRoomsNtfs = roomNotifications.access.filter(ntf => ntf._id === room._id)
      tabs[1].notifications = thisRoomsNtfs.length > 0 ? thisRoomsNtfs.length: '';
    } 
    return tabs;
  }

  render() {
    let { 
      room, match, user,
      accessNotifications, error, 
      clearError, courseMembers,
    } = this.props;
    if (room && !this.state.guestMode) {
      let resource = match.params.resource;
      let contentData = {
        resource,
        parentResource: 'rooms',
        parentResourceId: room._id,
        userResources: room[resource],
        owner: this.state.owner,
        notifications: accessNotifications.filter(ntf => ntf._id === room._id) || [],
        room,
        courseMembers,
        user,
      }
      let sidePanelData = {
        image: room.image,
        title: room.name,
        details: {
          main: room.name,
          secondary: room.description,
          additional: {
            // ESLINT thinks this is unnecessary but we use the keys directly in the dom and we want them to have spaces
            ['due date']: moment(room.dueDate).format('ddd, MMM D') || 'no due date set',
            code: room.entryCode,
            type: room.roomType,
          }
        },
        edit: {}
      }

      let crumbs = [
        {title: 'My VMT', link: '/myVMT/courses'},
        {title: room.name, link: `/myVMT/rooms/${room._id}/details`}]
        //@TODO DONT GET THE COURSE NAME FROM THE ROOM...WE HAVE TO WAIT FOR THAT DATA JUST GRAB IT FROM
        // THE REDUX STORE USING THE COURSE ID IN THE URL
      if (room.course) {crumbs.splice(1, 0, {title: room.course.name, link: `/myVMT/courses/${room.course._id}/activities`})}

      return (
        <Aux>
          <DashboardLayout
            routingInfo={this.props.match}
            crumbs={crumbs}
            contentData={contentData}
            sidePanelData={sidePanelData}
            tabs={this.state.tabs}
            activeTab={resource}
            loading={this.props.loading}
            activateTab={event => this.setState({activeTab: event.target.id})}
          />
          <Modal show={this.state.firstView} close={() => this.setState({firstView: false })}>
            <p>Welcome to {room.name}. If this is your first time joining a course,
            we recommend you take a tour. Otherwise you can start exploring this room's features.</p>
            <Button click={() => this.setState({firstView: false})}>Explore</Button>
          </Modal>
        </Aux>
      )
    } else return (
      <Access  
        resource='rooms'
        resourceId={match.params.room_id}
        userId={user._id}
        username={user.username}
        owners={room ? room.members.filter(member => member.role === 'facilitator').map(member => member.user) : []}
        error={error}
        clearError={clearError}
      />
    )
  }
}

const mapStateToProps = (store, ownProps) => {
  let { room_id } = ownProps.match.params;
  return {
    room: store.rooms.byId[room_id],
    // courseMembers:  store.rooms.byId[room_id].course ? store.courses.byId[store.rooms.byId[room_id].course._id].members : null,// ONLY IF THIS ROOM BELONGS TO A COURSE
    user: store.user,
    accessNotifications: store.user.roomNotifications.access,
    loading: store.loading.loading,
    error: store.loading.errorMessage,
  }
}

export default connect(mapStateToProps, {enterRoomWithCode, populateRoom, requestAccess, clearError, clearNotification})(Room);
