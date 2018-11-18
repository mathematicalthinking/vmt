import React, { Component } from 'react';
import DashboardLayout from '../Layout/Dashboard/Dashboard';
// import Activities from '../Activities/Activities';
import { getUserResources }from '../store/reducers';
import { connect } from 'react-redux';
import {
  getRooms,
  getActivities,
  getCourses,
  getUser,
  toggleJustLoggedIn,
} from '../store/actions'

class Profile extends Component {
  state = {
    tabs: [
      {name: 'Courses'},
      {name: 'Activities'},
      {name: 'Rooms'},
    ],
    touring: false,
    bothRoles: false,
    displayResources: [],
    view: 'facilitator',
  }

  componentDidMount() {
    // this.fetchData(this.props.match.params.resource)
    if (!this.props.user.justLoggedIn) {
      this.props.getUser(this.props.user._id) 
    }
    this.checkMultipleRoles()
    .then(res => this.setDisplayResources()) 
    .then(res => {
      this.updateTabs()
      this.props.toggleJustLoggedIn();
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const { loading } = this.props;
    const { resource } = this.props.match.params;
    // IF THE USER HAS A NEW RESOURCE
    if (prevProps[`user${resource}`].length !== this.props[`user${resource}`].length) {
      this.checkMultipleRoles()
      .then(() => this.setDisplayResources())
      .then(res => this.updateTabs())
    }

    if (!loading && this.props[resource].length < this.props.user[resource].length) {
      console.log('there is a resource on the user list that is not in the store')
      let idsToFetch = this.props.user[resource].filter(id => !this.props[resource].includes(id))
      console.log(idsToFetch)
      this.fetchByIds(resource, idsToFetch)
    } 
    // // WHen we've finished loading make sure all the resources on the user object are also populated in the store
    // if (!loading) {
    //   let haveResource = user[resource].every(rsrc => this.props[resource].includes(rsrc))
    //   if (!haveResource) {
    //     this.fetchData(resource)
    //   }
    // }

    // // @TODO CONFIRM THIS IS DUPLICATE COE OF THE FIRST IF CONDITION HERE...THE USER LIST OF COURSES SHOULD NEVER CHANGE INDEPENDENT OF THE STORES LIST OF COURSES E.G.
    // if (!loading) {
    //   if (prevProps[resource].length !== this.props[resource].length) {
    //     this.checkMultipleRoles()
    //     .then(() => this.setDisplayResources())
    //     .then(() => this.updateTabs())
    //   }
    // }

    if (prevState.view !== this.state.view) {
      this.setDisplayResources()
      .then(() => this.updateTabs())
    }

    // IF THE RESOURCE HAS CHANGED
    if (prevProps.match.params.resource !== resource) {
      this.props.getUser(this.props.user._id) // if wee implement push notifications we can get rid of this
      // this.fetchData(resource)
      this.checkMultipleRoles()
      .then(() => {this.setDisplayResources()})
    }
    // does this EVER HAPPEM?
    if (prevProps.user.courseNotifications.access.length !== this.props.user.courseNotifications.access.length ||
    prevProps.user.roomNotifications.access.length !== this.props.user.roomNotifications.access.length) {
      this.checkMultipleRoles()
        .then(() => this.setDisplayResources())
        .then(() => this.updateTabs())
    }
  }
  
  // CHekcs if the user has mulitple roles for a single resource (i.e. facilitator and participant)
  // if so we toggle the "view as" buttons to be visible
  checkMultipleRoles = () => {
    const { match, user, } = this.props;
    return new Promise(resolve => {
      if (match.params.resource === 'activities') {
        this.setState({bothRoles: false, view: 'facilitator'})
        return resolve(); // Activities are for facilitators only
      }
    // determine roles
      let isFacilitator = false;
      let isParticipant = false;
      let bothRoles = false;
      let view = 'facilitator';
      if (this.props[`user${match.params.resource}`]) {
        this.props[`user${match.params.resource}`].forEach(resource => {
          resource.members.forEach((member) => {
            if (member.user._id === user._id) {
              if (member.role === 'participant') isParticipant = true;
              if (member.role === 'facilitator') isFacilitator = true;
            }
          })
        })
      }
      // @TODO Theres some redundancy here
      if (isFacilitator && isParticipant) bothRoles = true
      else view = isFacilitator ? 'facilitator' : 'participant';
      this.setState({
        bothRoles,
        view,
      }, () => resolve())
    })
  
  }

  fetchByIds = (resource, ids) => {
    resource = resource.charAt(0).toUpperCase() + resource.slice(1)
    this.props[`get${resource}`](ids)
  }

  updateTabs = () => {
    // const { resource } = this.props.match.params;
    let { courseNotifications, roomNotifications } = this.props.user; // add room notifications eventually
    let updatedTabs = [...this.state.tabs]
    // let courseNtfs = courseNotifications.access.filter(ntf => { //WHY ARE WE FILTERING HERE ? WE SHOULD BE FILTERING FOR THEIR ROLE NOT THE RESOURCE ID
    //   let found = false;
    //   this.state.displayResources.forEach(resource => {
    //     if (resource._id === ntf._id) {
    //      found = true; 
    //     }
    //   })
    //   return found;
    // })
    let courseNtfs = courseNotifications.access;
    updatedTabs[0].notifications = courseNtfs.length === 0 ? '' : courseNtfs.length;
    // if (courseNotifications.newRoom.length > 0){
    //   updatedTabs[0].notifications += courseNotifications.newRoom.length;
    // }
    if (roomNotifications.access.length > 0){
      updatedTabs[2].notifications = roomNotifications.access.length;
    }
    this.setState({
      tabs: updatedTabs
    })
  }
  
  // Display different content depending on the user's current role
  setDisplayResources = () => {
    return new Promise((resolve => {
      let { user, match } = this.props;
      let { resource } = match.params;
      if (match.params.resource === 'activities') {
        this.setState({displayResources: this.props[`user${resource}`]})
        return resolve();
      }
      let displayResources = [];
      if (this.props[`user${resource}`]) {
        displayResources = this.props[`user${resource}`].filter(rsrc => {
          let included = false
          rsrc.members.forEach(member => {
            if (member.user._id === user._id && member.role === this.state.view) {
              included = true;
            }
          })
          return included;
        })
      }
      this.setState({displayResources, }, () => resolve())
    }))
  }

  toggleView = (event, data) => {
    this.setState({view: event.target.innerHTML.toLowerCase()})
  }


  render() {
    let { user, match } = this.props;
    let resource = match.params.resource;
    let contentData = {
      resource,
      userResources: this.state.displayResources,
      notifications: (resource === 'courses') ? user.courseNotifications.access : user.roomNotifications.access,
      user,
    }
    const sidePanelData = {
      image: user.profilePic,
      details: {
        main: `${user.firstName || ''} ${user.lastName || ''}`,
        secondary: user.username,
        additional: {
          courses: user.courses.length,
          rooms: user.rooms.length,
          activities: user.activities.length, 
        }
      },
      // edit: {link: '/profile', text: 'edit profile'}
      edit: {}
    }
    return (
      // <Aux>
        <DashboardLayout
          routingInfo={match}
          crumbs={[{title: 'My VMT', link: '/myVMT/courses'}]}
          contentData={contentData}
          sidePanelData={sidePanelData}
          tabs={this.state.tabs}
          accountType={user.accountType}
          bothRoles={this.state.bothRoles}
          toggleView={this.toggleView}
          view={this.state.view}
        />
      // </Aux>
    )
  }
}

// @NB THE LACK OF CAMEL CASE HERE IS INTENTIONAL AND ALLOWS US TO AVOID LOTS
// OF CONDITIONAL LOGIC CHECKING THE RESOURCE TYPE AND THEN GRABBING DATA BASED
// ON ITS VALUE. INSTEAD, WITH THE CURRENT METHOD WE CAN DO LIKE user[resource] or get[resource]
const mapStateToProps = store => ({
  usercourses: getUserResources(store, 'courses') || [],
  userrooms: getUserResources(store, 'rooms') || [],
  useractivities: getUserResources(store, 'activities') || [],
  user: store.user,
  rooms: store.rooms.allIds,
  courses: store.courses.allIds,
  activities: store.activities.allIds,
  loading: store.loading.loading,
})

export default connect(mapStateToProps, {
  getRooms,
  getActivities,
  getCourses,
  getUser,
  toggleJustLoggedIn,
})(Profile);
