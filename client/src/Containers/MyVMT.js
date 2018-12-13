import React, { Component } from 'react';
import DashboardLayout from '../Layout/Dashboard/Dashboard';
// import Activities from '../Activities/Activities';
// import { getUserResources }from '../store/reducers';
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
    // if (!this.props.user.justLoggedIn) {
    this.props.getUser(this.props.user._id) 
    // }
    this.checkMultipleRoles()
    .then(res => this.setDisplayResources()) 
    .then(res => {
      this.updateTabs()
      this.props.toggleJustLoggedIn();
    })
  }

  componentDidUpdate(prevProps, prevState) {
    let { user, match } = this.props;
    let { resource } = match.params;
    // If the user has a new resource
    // if (prevProps.user[resource].length !== this.props.user[resource].length) {
    //   console.log('the user"s resources have changes')
    //   let idsToFetch = user[resource].filter(id => !this.props[resource].includes(id))
    //   console.log("IDS TO FETCH: ", idsToFetch)
    //   if (idsToFetch.length > 0) {
    //     this.fetchData(resource, idsToFetch)
    //   }
    //   // this.checkMultipleRoles()
    //   // .then(() => this.setDisplayResources())
    //   // .then(res => this.updateTabs())
    // }
    // IF THE USER HAS A RESOURCE THAT HAS NOT BEEN ADDED TO THE STORE YET WE SHOULD FETCH IT
    if (!this.props.loading) {
      if (this.props.user[resource].length > this.props[resource].allIds.length) {
        // console.log('we need to fetch some resources')
        let idsToFetch = user[resource].filter(id => !this.props[resource].allIds.includes(id));
        // console.log(idsToFetch)
        this.fetchByIds(resource, idsToFetch)
      }
    }

    // @TODO CONFIRM THIS IS DUPLICATE COE OF THE FIRST IF CONDITION HERE...THE USER LIST OF COURSES SHOULD NEVER CHANGE INDEPENDENT OF THE STORES LIST OF COURSES E.G.
    // if (!loading) {
      if (prevProps[resource].allIds.length !== this.props[resource].allIds.length) {
        // console.log("this should update after fetch")
        this.checkMultipleRoles()
        .then(() => this.setDisplayResources())
        .then(() => this.updateTabs())
      }
    // }
    // If the view (role) has changes
    if (prevState.view !== this.state.view) {
      this.setDisplayResources()
      .then(() => this.updateTabs())
    }
    // If the resource has changes
    if (prevProps.match.params.resource !== resource) {
      this.props.getUser(this.props.user._id) // if we implement push notifications we can get rid of this
      this.checkMultipleRoles()
      .then(() => {this.setDisplayResources()})
    }
    // If the user has new notifications
    if (prevProps.user.courseNotifications.access.length !== this.props.user.courseNotifications.access.length ||
    prevProps.user.roomNotifications.access.length !== this.props.user.roomNotifications.access.length) {
      // console.log('the notifications have changed')
      this.checkMultipleRoles()
        .then(() => this.setDisplayResources())
        .then(() => this.updateTabs())
    }
  }
  
  // CHekcs if the user has mulitple roles for a single resource (i.e. facilitator and participant)
  // if so we toggle the "view as" buttons to be visible
  checkMultipleRoles = () => {
    let { match, user, } = this.props;
    let { resource } = match.params;
    return new Promise(resolve => {
      if (match.params.resource === 'activities') {
        this.setState({bothRoles: false, view: 'facilitator'})
        return resolve(); // Activities are for facilitators only
      } else {
      // determine roles
        let isFacilitator = false;
        let isParticipant = false;
        let bothRoles = false;
        let view = 'facilitator';
        if (this.props[resource]) {
          this.props[resource].allIds.forEach(id => {
            this.props[resource].byId[id].members.forEach((member) => {
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
      }
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
      // let roomNotifications = roomNotifications.filter(ntf => ntf._id ===)
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
      let myActivities;
      if (match.params.resource === 'activities') {
        myActivities = this.props[resource].allIds.filter(id => {
          if (this.props[resource].byId[id].creator === user._id) {
            return true;
          }
          return false;
        })
        return this.setState({displayResources: myActivities}, () => resolve())
      }
      let displayResources = [];
      if (this.props[resource]) {
        // console.log('the resource were looking for exists')
        displayResources = this.props[resource].allIds.filter(id => {
          let included = false
          if (this.props[resource].byId[id].members) {
            this.props[resource].byId[id].members.forEach(member => {
              if (member.user._id === user._id && member.role === this.state.view) {
                // console.log('this ', id, ' should be included')
                included = true;
              }
            })
            return included;
          } 
          return false;
        })
      }
      // console.log("DISPLAY RESOURCES: ", displayResources)
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
      userResources: this.state.displayResources.map(id => this.props[resource].byId[id]) || [],
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
  user: store.user,
  rooms: store.rooms,
  courses: store.courses,
  activities: store.activities,
  loading: store.loading.loading,
})

export default connect(mapStateToProps, {
  getRooms,
  getActivities,
  getCourses,
  getUser,
  toggleJustLoggedIn,
})(Profile);
