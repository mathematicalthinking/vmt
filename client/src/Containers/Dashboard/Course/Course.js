import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import API from '../../utils/apiRequests';
import Dashboard from '../../Layout/Dashboard/Dashboard';
import NewRoom from '../Create/NewRoom/NewRoom'
import BoxList from '../../Layout/BoxList/BoxList';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Button from '../../Components/UI/Button/Button';
import Students from './Students/Students';
class Course extends Component {
  state = {
    activeTab: 'Rooms',
    access: false,
    guestMode: false,
    currentCourse: {}, // Right now I'm just saving currentCourse is state to compare the incoming props currentCourse to look for changes
    tabs: [
      {name: 'Rooms'},
      {name: 'Students'},
      {name: 'Grades'},
      {name: 'Insights'},
      {name:'Settings'}
    ],
  }
  // Check if the user has access to this course
  // @TODO Yikes this is messy. This could all be avoided if
  // we didnt do the API call through redux.
  static getDerivedStateFromProps(nextProps, prevState) {
    const currentCourse = nextProps.currentCourse;
    if (currentCourse !== prevState.currentCourse) {
      let access = false;
      let guestMode = false;
      let studentNotifications = 0;
      // let roomNotifications = 0;
      const updatedTabs = [...prevState.tabs];
      // check permissions
      if (currentCourse.members) {
        if (currentCourse.members.find(member => member.user._id === nextProps.userId)){
          access = true;
        } else {
          access = true;
          guestMode = true;
        }
      }
      // check notifications
      if (currentCourse.notifications) {
        nextProps.currentCourse.notifications.forEach(notification => {
          if (notification.notificationType === 'requestAccess') {
            studentNotifications += 1;
          }
        })
        updatedTabs[1].notifications = studentNotifications;
      }
      return {
        tabs: updatedTabs,
        access,
        guestMode,
        currentCourse,
      }
    } else return null
  }

  componentDidMount() {
    // populate the courses data
    console.log(this.props.match)
    console.log("CurrentCourse from redux IN COMPONENT DID MOUNT: ", this.props.currentCourse)
    if (Object.keys(this.props.currentCourse).length === 0) {
      console.log('dispatching action')
      this.props.getCurrentCourse(this.props.match.params.course_id)
    }
  }

  activateTab = event => {
    this.setState({activeTab: event.target.id});
  }

  requestAccess = () => {
    // Should we make this post through redux? I don't really see a good reason to
    // we don't need access to this information anywhere else in the app
    API.requestAccess('course', this.props.match.params.course_id, this.props.userId)
    .then(res => {
      // @TODO SEND/DISPLAY CONFIRMATION somehow
      this.props.history.push('/profile')
    })
  }

  render() {
    const course = this.props.currentCourse;
    const active = this.state.activeTab;
    let content;
    let contentCreate;
    switch (active) {
      case 'Rooms' :
        contentCreate = <NewRoom course={course._id} updateParent={room => this.props.updateCourseRooms(room)}/>
        content = <BoxList list={course.rooms ? course.rooms : []} resource={'room'} notifications={true} dashboard={true} course={course._id}/>
        break;
      case 'Students' :
        let notifications = course.notifications.filter(ntf => (ntf.notificationType === 'requestAccess'))
        content = <Students classList={course.members} notifications={notifications} course={course._id}/>
        break;
      default : content = null;
    }
    const guestModal = this.state.guestMode ?
      <Modal show={true}>
        <p>You currently don't have access to this course. If you would like to
          request access from the owner click "Join". When your request is accepted
          this course will appear in your list of courses on your dashboard.
        </p>
        <Button click={this.requestAccess}>Join</Button>
      </Modal> : null;
    const accessModal = !this.state.access ? <Modal show={true} message='Loading course'/> : null;
    return (
      <Aux>
        {guestModal}
        {accessModal}
        <Dashboard
          title={course.name ? `Course: ${course.name}` : null}
          crumbs={[{title: 'Profile', link: '/dashboard'}, {title: course.name ? course.name : null, link: `/dashboard/course/${course._id}`}]}
          sidePanelTitle={course.name}
          contentCreate={contentCreate}
          content={content}
          tabs={this.state.tabs}
          activeTab={this.state.activeTab}
          activateTab={event => this.setState({activeTab: event.target.id})}
        />
      </Aux>
        )
  }
}

const mapStateToProps = store => {
  return {
    currentCourse: store.coursesReducer.currentCourse,
    userId: store.userReducer.userId,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateCourseRooms: room => dispatch(actions.updateCourseRooms(room)),
    getCurrentCourse: id => dispatch(actions.getCurrentCourse(id)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Course);
