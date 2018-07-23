import React, { Component } from 'react';
import Main from '../../Layout/Main/Main';
import classes from './course.css';
import NewRoom from '../Rooms/NewRoom/NewRoom'
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
    API.getById('course', this.props.match.params.id)
    .then(res => this.setState({course: res.data.result}))
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
        contentCreate = <NewRoom />
        contentList = this.state.course.rooms
      default : resource = null;
    }
    if (this.state.course.rooms && active === 'Rooms') {
      contentList = this.state.course.rooms
      content = <BoxList list={contentList} resource={'room'}/>
    }
    return (
      <Main
        title={this.state.course.name ? `Course: ${this.state.course.name}` : null}
        sidePanelTitle={this.state.course.name}
        contentCreate={contentCreate}
        content={content}
        tabs={tabs}
        activeTab={this.state.activeTab}
        activateTab={event => this.setState({activeTab: event.target.id})}
      />
    )
  }
}

export default Course;
