import React, { Component } from 'react';
import Main from '../../Layout/Main/Main';
import BoxList from '../../Layout/BoxList/BoxList';
import NewCourse from '../Courses/NewCourse/NewCourse';
import { connect } from 'react-redux';
const tabs = ['Courses', 'Rooms', 'Templates', 'Settings']
class Profile extends Component {
  state = {
    activeTab: 'Courses',
  }
  activateTab = event => {
    this.setState({activeTab: event.target.id});
  }
  render() {

    let contentList = [];
    let resource;
    switch (this.state.activeTab) {
      case 'Courses' :
        contentList = this.props.myCourses;
        resource = 'course';
        break;
      case 'Rooms' :
        contentList = this.props.myRooms;
        resource = 'room';
        break;
      default:
        resource = null;
    }
    let content = <BoxList list={contentList} resource={resource} />
    if (contentList.length === 0) {content = `You don't seem to have any ${resource}s yet. Click "Create" to get started`}
    return (
      <Main
        content={content}
        contentCreate={NewCourse}
        tabs={tabs}
        activeTab={this.state.activeTab}
        activateTab={event => this.setState({activeTab: event.target.id})}
      />
    )
  }
}

const mapStateToProps = store => {
  const user = store.userReducer;
  return {
    myRooms: user.myRooms,
    myCourses: user.myCourses,
    myCourseTemplates: user.myCourseTemplates,
    myRoomTemplates: user.myRoomTemplates,
    username: user.username
  }
}
const mapDispatchToProps = dispatch => {

}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
