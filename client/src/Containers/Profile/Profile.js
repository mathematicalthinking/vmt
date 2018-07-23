import React, { Component } from 'react';
import Main from '../../Layout/Main/Main';
import BoxList from '../../Layout/BoxList/BoxList';
import NewCourse from '../Create/NewCourse/NewCourse';
import NewRoom from '../Create/NewRoom/NewRoom';
import * as actions from '../../store/actions/';
import { connect } from 'react-redux';
const tabs = ['Courses', 'Rooms', 'Templates', 'Settings']
class Profile extends Component {
  state = {
    activeTab: 'Courses',
    modalOpen: false,
  }
  activateTab = event => {
    this.setState({activeTab: event.target.id});
  }
  render() {

    let contentList = [];
    let resource;
    let contentCreate;
    switch (this.state.activeTab) {
      case 'Courses' :
        resource = 'course';
        contentList = this.props.myCourses;
        contentCreate = <NewCourse />;
        break;
      case 'Rooms' :
        contentList = this.props.myRooms;
        contentCreate = <NewRoom />
        resource = 'room';
        break;
      default:
        resource = null;
    }
    let content = <BoxList list={contentList} resource={resource} />
    if (contentList.length === 0) {content = `You don't seem to have any ${resource}s yet. Click "Create" to get started`}

    return (
      <Main
        title='Profile'
        sidePanelTitle={this.props.username}
        content={content}
        contentCreate={contentCreate}
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
    rooms: store.roomsReducer.rooms,
    myCourses: user.myCourses,
    myCourseTemplates: user.myCourseTemplates,
    myRoomTemplates: user.myRoomTemplates,
    username: user.username
  }
}
const mapDispatchToProps = dispatch => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
