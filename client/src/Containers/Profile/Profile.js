import React, { Component } from 'react';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Resources from '../../Layout/Dashboard/Resources/Resources';
import difference from 'lodash/difference'
// import Assignments from '../Assignments/Assignments';
import { getUserResources }from '../../store/reducers/';
import { connect } from 'react-redux';
import * as actions from '../../store/actions'

class Profile extends Component {
  state = {
    tabs: [
      {name: 'Courses'},
      {name: 'Assignments'},
      {name: 'Rooms'},
      {name: 'Settings'},
    ],
    touring: false,
  }

  componentDidMount() {
    const { courseNotifications, roomNotifications } = this.props.user;
    const updatedTabs = [...this.state.tabs]
    // if (!user.seenTour) {
    //   this.setState({touring: true})
    // }
    if (courseNotifications.access.length > 0) {
      updatedTabs[0].notifications = courseNotifications.access.length;
    }
    if (courseNotifications.newRoom.length > 0){
      updatedTabs[0].notifications += courseNotifications.newRoom.length;
    }
    if (roomNotifications.newRoom.length > 0){
      updatedTabs[1].notifications = roomNotifications.newRoom.length;
    }
    console.log(updatedTabs)
    this.setState({
      tabs: updatedTabs
    })
  }

  componentDidUpdate(prevProps, prevState) {
    // check that we have the data we need
    const { user, loading } = this.props;
    const { resource } = this.props.match.params;
    console.log(resource)
    console.log(user[resource])
    console.log('ASSIGNMENTS: ', this.props[resource])
    if (!loading) {
      if (user[resource].length !== this.props[resource].length) {
        this.fetchData(resource)
      }
      else {
        let haveResource = user[resource].every(re => this.props[resource].includes(re))
        if (!haveResource) this.fetchData(resource)
      }
      return;
    }
  }

  fetchData = resource => {
    this.props[`get${resource}`]()
  }

  render() {
    const { user, match } = this.props;
    const resource = match.params.resource;
    console.log('RESOURCE: ', resource)
    console.log(this.props[`user${resource}`])
    let content;
    // Load content based on
    // const updatedResources = {...this.props[resource]}
    content = <Resources
      userResources={this.props[`user${resource}`] || []}
      notifications={resource === 'courses' ? user.courseNotifications : user.roomNotifications}
      resource={resource}
      userId={user.id}
              />
    return (
      // <Aux>
        <DashboardLayout
          routingInfo={this.props.match}
          title='Profile'
          crumbs={[{title: 'Profile', link: '/profile/courses'}]}
          sidePanelTitle={this.props.user.username}
          content={content}
          tabs={this.state.tabs}
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
  userassignments: getUserResources(store, 'assignments'),
  user: store.user,
  rooms: store.rooms.allIds,
  courses: store.courses.allIds,
  assignments: store.assignments.allIds,
  // HACK WHEN THE COMPONENT UPDATES WE COMPARE USER RESOURCES AND RESOURCES TO SEE
  // IF WE NEED TO FETCH DATA. HOWEVER. WHEN WE CREATE A NEW RESOURCE THE USER RESOURCES
  // AND RESOURCES ARE OUT OF SYNCH FOR A SPLIT SECOND. IF WE MARK WHEN THE USER IS
  // CREATING SOMETHING WE CAN SKIP THE FETCH CHECK UNTIL THE CREATING FLAG IS TURNED
  // BACK OFF
  loading: store.loading.loading,
})
const mapDispatchToProps = dispatch => ({
  getrooms: () => dispatch(actions.getRooms()),
  getassignments: () => dispatch(actions.getAssignments())
})


export default connect(mapStateToProps, mapDispatchToProps)(Profile);
