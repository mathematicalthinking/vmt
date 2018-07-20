import React, { Component } from 'react';
import Main from '../../Layout/Main/Main';
import { connect } from 'react-redux';
const tabs = ['Courses', 'Rooms', 'Templates', 'Settings']
class Profile extends Component {
  state = {
    activeTab: 'Courses',
  }
  render() {
    return (
      <Main />
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
