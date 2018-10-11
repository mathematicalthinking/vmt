import React, { Component } from 'react';
import DashboardLayout from '../Layout/Dashboard/Dashboard';
// import Activities from '../Activities/Activities';
import { getUserResources }from '../store/reducers';
import { connect } from 'react-redux';
import * as actions from '../store/actions'

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
    view: 'teacher',
  }

  componentDidMount() {
    // I WONDER IF USING PROMISES LIKE THIS IS BAD?
    // I NEED TO UPDATE STATE IN CHECK MULTIPLE ROLE AND THEN setDisplayResources DEPENDS ON THAT STATE UPDATE
    this.checkMultipleRoles()
    .then(res => {return this.setDisplayResources()}) 
    .then(res => this.updateTabs())
  }

  componentDidUpdate(prevProps, prevState) {
    // IF WE JUST CREATED A NEW RESOURCE WE SHOULD CHECK FOR MULTIPLE ROLES AGAIN
    // const {roomNotifications, courseNotifications } = this.props.user
    // if (roomNotifications.access.length !== prevProps.user.roomNotifications.access.length
    // || courseNotifications.access.length !== prevProps.user.courseNotifications.access.length
    // || )
    // this.updateTabs()
    // check that we have the data we need
    const { user, loading } = this.props;
    const { resource } = this.props.match.params;
    if (prevProps[`user${resource}`].length !== this.props[`user${resource}`].length) {
      console.log("A NEW REC WAS ADDES")
      this.checkMultipleRoles()
      .then(() => this.setDisplayResources())
      .then(res => this.updateTabs())
    }
    if (!loading) {
      let haveResource = user[resource].every(re => this.props[resource].includes(re))
      if (!haveResource) this.fetchData(resource)
    }
    if (prevState.view !== this.state.view) {
      console.log('view changed')
      this.setDisplayResources()
      .then(() => this.updateTabs())
    }

    if (prevProps.match.params.resource !== resource) {
      this.checkMultipleRoles()
      .then(() => {this.setDisplayResources()})
    }
  }
  
  // CHekcs if the user has mulitple roles for a single resource (i.e. teacher and student)
  // if so we toggle the "view as" buttons to be visible
  checkMultipleRoles = () => {
    const { match, user, } = this.props;
    return new Promise(resolve => {
      if (match.params.resource === 'activities') {
        this.setState({bothRoles: false, view: 'teacher'})
        return resolve(); // Activities are for teachers only
      }
    // determine roles
      let isTeacher = false;
      let isStudent = false;
      let bothRoles = false;
      let view = 'teacher';
      if (this.props[`user${match.params.resource}`]) {
        this.props[`user${match.params.resource}`].forEach(resource => {
          resource.members.forEach((member) => {
            if (member.user._id === user._id) {
              if (member.role === 'student') isStudent = true;
              if (member.role === 'teacher') isTeacher = true;
            }
          })
        })
      }
      if (isTeacher && isStudent) bothRoles = true
      else view = isTeacher ? 'teacher' : 'student';
      this.setState({
        bothRoles,
        view,
      }, () => resolve())
    })
  
  }

  fetchData = resource => {
    this.props[`get${resource}`]()
  }

  updateTabs = () => {
    const { resource } = this.props.match.params;
    const { courseNotifications, roomNotifications } = this.props.user;
    const updatedTabs = [...this.state.tabs]
    const courseNtfs = courseNotifications.access.filter(ntf => {
      let found = false;
      this.state.displayResources.forEach(resource => {
        if (resource._id === ntf._id) {
         found = true; 
        }
      })
      return found;
    })
    // console.log(courseNotifications.access)
    updatedTabs[0].notifications = courseNtfs.length === 0 ? '' : courseNtfs.length;
    // if (courseNotifications.newRoom.length > 0){
    //   updatedTabs[0].notifications += courseNotifications.newRoom.length;
    // }
    // if (roomNotifications.newRoom.length > 0){
    //   updatedTabs[1].notifications = roomNotifications.newRoom.length;
    // }
    this.setState({
      tabs: updatedTabs
    })
  }
  
  setDisplayResources = () => {
    return new Promise((resolve => {
      const { user, match } = this.props;
      const { resource } = match.params;
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
    const { user, match } = this.props;
    const resource = match.params.resource;
    const contentData = {
      resource,
      userResources: this.state.displayResources,
      notifications: (resource === 'courses') ? user.courseNotifications.access : user.roomNotifications,
      userId: user._id,
    }
    const sidePanelData = {
      title: 'My VMT',
      image: user.profilePic,
      details: 'some details about the user?'
    }
    return (
      // <Aux>
        <DashboardLayout
          routingInfo={match}
          title='My VMT'
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
const mapDispatchToProps = dispatch => ({
  getrooms: () => dispatch(actions.getRooms()),
  getactivities: () => dispatch(actions.getActivities()),
  getcourses: () => dispatch(actions.getCourses())
})


export default connect(mapStateToProps, mapDispatchToProps)(Profile);
