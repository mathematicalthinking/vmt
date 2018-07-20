import React, { Component } from 'react';
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
    let content;
    if (this.state.course.rooms && active === 'Rooms') {
      content = <BoxList list={this.state.course.rooms} resource={'room'}/>
    }
    return (
      <section className={classes.Container}>
        <section className={classes.SidePanel}>
          <div className={classes.CourseImage}>Image</div>
          <div className={classes.CourseName}><b>{this.state.course.name}</b></div>
          <div className={classes.Instructor}>
            <b>Instructor: </b>{this.state.course.creator.username}
          </div>
          <div className={classes.Description}>{this.state.course.description}</div>
        </section>
        <section className={classes.Main}>
          <div className={classes.Tabs}>
            {tabElems}
          </div>
          <div className={classes.MainContent}>
            {content}
          </div>
        </section>
      </section>
    )
  }
}

export default Course;
