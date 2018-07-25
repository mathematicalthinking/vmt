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
const tabs = [
  {name: 'Rooms', notifications: 0},
  {name: 'Students', notifications: 0},
  {name: 'Grades', notifications: 0},
  {name: 'Insights', notifications: 0},
  {name:'Settings'}
];
class Course extends Component {
  state = {
    activeTab: 'Rooms',
    access: false,
    guestMode: false,
    currentCourse: '',
  }

  componentDidMount() {
    // populate the courses data
    console.log(this.props.match.params.id)
    this.props.getCurrentCourse(this.props.match.params.id)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.currentCourse !== prevState.currentCourse && nextProps.currentCourse.members) {
      console.log('got currentCourse')
      if (nextProps.currentCourse.members.find(member => member.user === nextProps.userId)){
        console.log(nextProps.currentCourse)
        return {
          access: true,
          currentCourse: nextProps.currentCourse,
        }

      } else {
        return {
          access: true,
          guestMode: true,
          currentCourse: nextProps.currentCourse
        }
      }
    }
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
    const course = this.props.currentCourse;
    const active = this.state.activeTab;
    let contentList = [];
    let content;
    let resource;
    let contentCreate;
    switch (active) {
      case 'Rooms' :
        resource = 'room';
        contentCreate =
        <NewRoom
          course={course._id}
          updateParent={room => this.props.updateCourseRooms(room)}
        />
        contentList = course.rooms ? course.rooms : [];
        break;
      case 'Students' :
        resource = 'user'
        contentCreate = <div>Add Students</div>
        contentList = course.students ? course.students : [];
        break;
      default : resource = null;
    }
    if (contentList.length === 0) {
      content = `You don't seem to have any ${resource}s yet. Click "Create" to get started`
    }
    content = <BoxList list={contentList} resource={'room'}/>
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
          tabs={tabs}
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
