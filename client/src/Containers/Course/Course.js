import React, { Component } from 'react';
import Main from '../../Layout/Main/Main';
import classes from './course.css';
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
    if (this.state.course.rooms && active === 'Rooms') {
      contentList = this.state.course.rooms
      content = <BoxList list={contentList} resource={'room'}/>
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

export default Course;
