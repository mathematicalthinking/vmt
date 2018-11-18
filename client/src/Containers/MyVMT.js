import React, { Component } from 'react';
import DashboardLayout from '../Layout/Dashboard/Dashboard';
// import Activities from '../Activities/Activities';
import { getUserResources }from '../store/reducers';
import { connect } from 'react-redux';
import {
  getRoomsIds,
  getActivitiesIds,
  getCoursesIds,
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
<<<<<<< HEAD
    // if (!this.props.user.justLoggedIn) {
=======
    if (!this.props.user.justLoggedIn) {
>>>>>>> mygod its working
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
<<<<<<< HEAD
    let { user, loading, match } = this.props;
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
    // IF THE USER HAS A RESOURCE THAT HASN'T BEEN POPULATED YET
    if (!this.props.loading) {
      if (this.props.user[resource].length > this.props[resource].allIds.length) {
        console.log('the user has a resource that hasn"t been populated yet')
        let idsToFetch = user[resource].filter(id => !this.props[resource].allIds.includes(id));
        console.log('idsTOFetch: ', idsToFetch)
        this.fetchData(resource, idsToFetch)
      }
    }

    // @TODO CONFIRM THIS IS DUPLICATE COE OF THE FIRST IF CONDITION HERE...THE USER LIST OF COURSES SHOULD NEVER CHANGE INDEPENDENT OF THE STORES LIST OF COURSES E.G.
    if (!loading) {
      if (prevProps[resource].allIds.length !== this.props[resource].allIds.length) {
        console.log('A new resource has been populated in the store')
        this.checkMultipleRoles()
        .then(() => this.setDisplayResources())
        .then(() => this.updateTabs())
      }
    }
    // If the view (role) has changes
=======
    const { user, loading } = this.props;
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

>>>>>>> mygod its working
    if (prevState.view !== this.state.view) {
      console.log(prevState.view, this.state.view)
      console.log('the role has changed')
      this.setDisplayResources()
      .then(() => this.updateTabs())
    }
<<<<<<< HEAD
    // If the resource has changes
=======

    // IF THE RESOURCE HAS CHANGED
>>>>>>> mygod its working
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
    let { match, user, } = this.props;
    let { resource } = match.params;
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
      if (match.params.resource === 'activities') {
        this.setState({displayResources: this.props[`user${resource}`]})
        return resolve();
      }
      let displayResources = [];
      if (this.props[resource]) {
        displayResources = this.props[resource].allIds.filter(id => {
          let included = false
          this.props[resource].byId[id].members.forEach(member => {
            if (member.user._id === user._id && member.role === this.state.view) {
              included = true;
            }
          })
          return included;
        })
      }
      console.log("DISPLAY RESOURCES: ", displayResources)
      this.setState({displayResources, }, () => resolve())
    }))
  }

  toggleView = (event, data) => {
    this.setState({view: event.target.innerHTML.toLowerCase()})
  }


  render() {
    console.log(this.state.displayResources)
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
  getRoomsIds,
  getActivitiesIds,
  getCoursesIds,
  getUser,
  toggleJustLoggedIn,
})(Profile);
