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
    const tabElems = tabs.map(tab => {
      let style = classes.Tab;
      if (tab === this.state.activeTab) {
        style = [classes.Tab, classes.ActiveTab].join(' ')
      }
      return (
        <div key={tab} id={tab} onClick={this.activateTab} className={style}>{tab}</div>
      )
    })
    const active = this.state.activeTab;
    let contentList;
    if (this.state.course.rooms && active === 'Rooms') {
      contentList = this.state.course.rooms
    }
    const content = <BoxList list={contentList} resource={'room'}/>
    return (
      <Main content={content} tabs={tabElems} />
        )
  }
}

export default Course;
