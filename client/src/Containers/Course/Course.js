import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/'
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
class Course extends Component {
  state = {
      tabs: [
        {name: 'Rooms', path:`/dashboard/courses/${this.props.courseId}/rooms`},
        {name: 'Students', path:`/dashboard/courses/${this.props.courseId}/students`},
        {name: 'Grades', path:`/dashboard/courses/${this.props.courseId}/grades`},
        {name: 'Insights', path:`/dashboard/courses/${this.props.courseId}/insights`},
        {name:'Settings', path:`/dashboard/courses/${this.props.courseId}/settings`}
      ],
    }
  componentDidMount() {
    this.props.getCurrentCourse(this.props.courseId)
  }
  render() {
    const { crumbs, currentCourse } =  this.props;
    const loaded = currentCourse.rooms ? true : false;
    console.log(this.props)
    const resource = this.props.match.params.resource || 'rooms';
    console.log(resource)
    return (
      this.props.dashboard ? <DashboardLayout
        crumbs={[...crumbs, {title: currentCourse.name, link: `/dashboard/courses/${this.props.courseId}/rooms`}]}
        tabs={this.state.tabs}
        resourceList={currentCourse.rooms}
        resource={resource}
        loaded={loaded}
                             /> : null //eventually return the public course view
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
