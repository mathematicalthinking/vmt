import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import API from '../../utils/apiRequests';
import Main from '../../Layout/Main/Main';
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
    currentCourse: {},
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
      if (currentCourse.members) {
        if (currentCourse.members.find(member => member.user === nextProps.userId)){
          console.log('hello!')
          access = true;
        } else {
          access = true;
          guestMode = true;
        }
      }
      if (currentCourse.notifications) {
        nextProps.currentCourse.notifications.forEach(notification => {
          console.log(notification)
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
      }
    } else return null
  }

  componentDidMount() {
    // populate the courses data
    console.log(this.props.match.params.id)
    this.props.getCurrentCourse(this.props.match.params.id)
  }


  activateTab = event => {
    this.setState({activeTab: event.target.id});
  }

  requestAccess = () => {
    // Should we make this post through redux? I don't really see a good reason to
    // we don't need access to this information anywhere else in the app
    API.requestAccess('course', this.props.match.params.id, this.props.userId)
    .then(res => {
      console.log(res.data.result)
      // @TODO SEND/DISPLAY CONFIRMATION somehow
      this.props.history.push('/profile')
    })
  }
  render() {
    console.log(this.state.tabs)
    const course = this.props.currentCourse;
    const active = this.state.activeTab;
    let content;
    let contentCreate;
    switch (active) {
      case 'Rooms' :
        contentCreate = <NewRoom course={course._id} updateParent={room => this.props.updateCourseRooms(room)}/>
        content = <BoxList list={course.rooms ? course.rooms : []} resource={'room'}/>
        break;
      case 'Students' :
      console.log(course)
        let notifications = course.notifications.filter(ntf => (ntf.notificationType === 'requestAccess'))
        content = <Students classList={course.members} notifications={notifications} />
        break;
      default : content = null;
    }
    const guestModal = this.state.guestMode ?
      <Modal show={true}>
        <p>You currently don't have access to this course. If you would like to
          reuqest access from the owner click "Join". When your request is accepted
          this course will appear in your list of courses on your dashboard.
        </p>
        <Button click={this.requestAccess}>Join</Button>
      </Modal> : null;
    const accessModal = !this.state.access ? <Modal show={true} message='Loading course'/> : null;
    return (
      <Aux>
        {guestModal}
        {accessModal}
        <Main
          title={course.name ? `Course: ${course.name}` : null}
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
