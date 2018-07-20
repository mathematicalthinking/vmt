import React, { Component } from 'react';
import Main from '../../Layout/Main/Main';
import BoxList from '../../Layout/BoxList/BoxList'
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
    let content;
    if (this.state.activeTab === 'Courses') {
      contentList = this.props.myCourses;
      content = <BoxList list={contentList} resource={'course'} />
    }
    return (
      <Main
        content={content}
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
