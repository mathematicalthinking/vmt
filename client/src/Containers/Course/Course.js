import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/'
import Main from '../../Layout/Main/Main';
import classes from './course.css';
import NewRoom from '../Create/NewRoom/NewRoom'
import BoxList from '../../Layout/BoxList/BoxList';
import API from '../../utils/apiRequests';
const tabs = ['Rooms', 'Students', 'Grades', 'Insights', 'Settings'];
class Course extends Component {
  state = {
    activeTab: 'Rooms',
    course: {
      creator: '',
    },
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
    const active = this.state.activeTab;
    let contentList = [];
    let content;
    let resource;
    let contentCreate;
    switch (this.state.activeTab) {
      case 'Rooms' :
        resource = 'room';
        contentCreate =
        <NewRoom
          course={this.props.currentCourse._id}
          updateParent={room => this.props.updateCourseRooms(room)}
        />
        contentList = this.props.currentCourse.rooms;
        break;
      default : resource = null;
    }
    if (this.props.currentCourse.rooms && active === 'Rooms') {
      contentList = this.props.currentCourse.rooms
      content = <BoxList list={contentList} resource={'room'}/>
    }
    console.log(this.props.currentCourse)
    return (
      <Main
        title={this.props.currentCourse.name ? `Course: ${this.props.currentCourse.name}` : null}
        sidePanelTitle={this.props.currentCourse.name}
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
