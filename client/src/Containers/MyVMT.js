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
    teacherView: false,
  }

  componentDidMount() {
    console.log(this.props)
    this.setState({teacherView: this.props.user.accountType === 'teacher'})
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

  render() {
    const { user, match } = this.props;
    const resource = match.params.resource;
    const contentData = {
      resource,
      userResources: this.props[`user${resource}`] || [],
      notifications: (resource === 'courses') ? user.courseNotifications : user.roomNotifications,
      userId: user._id
    }
    return (
      // <Aux>
        <DashboardLayout
          routingInfo={match}
          title='Profile'
          crumbs={[{title: 'Profile', link: '/profile/courses'}]}
          sidePanelTitle={user.username}
          contentData={contentData}
          tabs={this.state.tabs}
          user={user}
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
