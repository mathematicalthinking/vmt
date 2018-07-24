import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/'
import Main from '../../Layout/Main/Main';
import NewRoom from '../Create/NewRoom/NewRoom'
import BoxList from '../../Layout/BoxList/BoxList';
const tabs = ['Rooms', 'Students', 'Grades', 'Insights', 'Settings'];
class Course extends Component {
  state = {
    activeTab: 'Rooms',
  }

  componentDidMount() {
    // populate the courses data
    console.log(this.props.match.params.id)
    this.props.getCurrentCourse(this.props.match.params.id)
  }

  activateTab = event => {
    this.setState({activeTab: event.target.id});
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

    return (
      <Main
        title={course.name ? `Course: ${course.name}` : null}
        sidePanelTitle={course.name}
        contentCreate={contentCreate}
        content={content}
        tabs={tabs}
        activeTab={this.state.activeTab}
        activateTab={event => this.setState({activeTab: event.target.id})}
      />
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
