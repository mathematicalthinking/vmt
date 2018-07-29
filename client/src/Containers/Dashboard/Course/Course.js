import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/'
import DashboardLayout from '../../../Layout/Dashboard/Dashboard';
class Course extends Component {
  state = {
      tabs: [
        {name: 'Rooms'},
        {name: 'Students'},
        {name: 'Grades'},
        {name: 'Insights'},
        {name:'Settings'}
      ],
    }
  componentDidMount() {
    this.props.getCurrentCourse(this.props.courseId)
  }
  render() {
    const { crumbs, currentCourse } =  this.props;
    const loaded = currentCourse.rooms ? true : false;
    return (
      <DashboardLayout
        crumbs={[...crumbs, {title: currentCourse.name, link: `/dashboard/courses/${this.props.courseId}`}]}
        tabs={this.state.tabs}
        resourceList={currentCourse.rooms}
        resourse='courses'
        loaded={loaded}
      />
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
