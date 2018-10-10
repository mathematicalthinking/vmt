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
    view: 'teacher',
  }

  componentDidMount() {
    console.log(this.props)
    this.determineRoles();
    this.updateTabs();
  }

  componentDidUpdate(prevProps, prevState) {
    // const {roomNotifications, courseNotifications } = this.props.user
    // if (roomNotifications.access.length !== prevProps.user.roomNotifications.access.length
    // || courseNotifications.access.length !== prevProps.user.courseNotifications.access.length
    // || )
    // this.updateTabs()
    // check that we have the data we need
    const { user, loading } = this.props;
    const { resource } = this.props.match.params;
    if (!loading) {
      let haveResource = user[resource].every(re => this.props[resource].includes(re))
      if (!haveResource) this.fetchData(resource)
    }
  }
  
  // CHekcs if the user has mulitple roles for a single resource (i.e. teacher and student)
  // if so we toggle the "view as" buttons to be visible
  determineRoles = () => {
    const { match, user } = this.props;
  // determine roles
    let isTeacher = false;
    let isStudent = false;
    if (this.props[`user${match.params.resource}`]) {
      this.props[`user${match.params.resource}`].forEach(resource => {
        console.log(resource)
        resource.members.forEach((member) => {
          if (member.user._id === user._id) {
            if (member.role === 'student') isStudent = true;
            if (member.role === 'teacher') isTeacher = true;
          }
        })
      })
    }
    console.log('isTEacher: ', isTeacher, 'isStudent ', isStudent)
    if (isTeacher && isStudent) this.setState({bothRoles: true, view: 'teacher'})
    else this.setState({view: isTeacher ? 'teacher' : 'student'})
  }

  fetchData = resource => {
    this.props[`get${resource}`]()
  }

  updateTabs = () => {
    const { courseNotifications, roomNotifications } = this.props.user;
    const updatedTabs = [...this.state.tabs]
    if (courseNotifications.access.length > 0) {
      updatedTabs[0].notifications = courseNotifications.access.length;
    }
    if (courseNotifications.newRoom.length > 0){
      updatedTabs[0].notifications += courseNotifications.newRoom.length;
    }
    if (roomNotifications.newRoom.length > 0){
      updatedTabs[1].notifications = roomNotifications.newRoom.length;
    }
    this.setState({
      tabs: updatedTabs
    })
  }

  toggleView = (event) => {
    console.log(event.target.value)
  }

  render() {
    const { user, match } = this.props;
    const resource = match.params.resource;
    const resources = this.props[`user${resource}`].filter(resource => {
      let included = false
      resource.members.forEach(member => {
        if (member.user._id === user._id && member.role === this.state.view) {
          included = true;
        }
      })
      return included;
    })
    const contentData = {
      resource,
      userResources: resources || [],
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
          view={'teacher'}
        />
      // </Aux>
    )
  }
}

// @NB THE LACK OF CAMEL CASE HERE IS INTENTIONAL AND ALLOWS US TO AVOID LOTS
// OF CONDITIONAL LOGIC CHECKING THE RESOURCE TYPE AND THEN GRABBING DATA BASED
// ON ITS VALUE. INSTEAD, WITH THE CURRENT METHOD WE CAN DO LIKE user[resource] or get[resource]
const mapStateToProps = store => ({
  usercourses: getUserResources(store, 'courses'),
  userrooms: getUserResources(store, 'rooms'),
  useractivities: getUserResources(store, 'activities'),
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
