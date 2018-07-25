import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/'
import Main from '../../Layout/Main/Main';
import NewRoom from '../Create/NewRoom/NewRoom'
import BoxList from '../../Layout/BoxList/BoxList';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Button from '../../Components/UI/Button/Button';
const tabs = ['Rooms', 'Students', 'Grades', 'Insights', 'Settings'];
class Course extends Component {
  state = {
    activeTab: 'Rooms',
    guestMode: true,
  }

  componentDidMount() {
    // populate the courses data
    console.log(this.props.match.params.id)
    this.props.getCurrentCourse(this.props.match.params.id)
    // if (this.props.course.members.includes())
  }

  activateTab = event => {
    this.setState({activeTab: event.target.id});
  }

  requestAccess = () => {
    
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
    return (
      <Aux>
        {guestModal}
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
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateCourseRooms: room => dispatch(actions.updateCourseRooms(room)),
    getCurrentCourse: id => dispatch(actions.getCurrentCourse(id)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Course);
