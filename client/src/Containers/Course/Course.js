import React, { Component } from 'react';
import classes from './course.css';
import Rooms from '../Rooms/Rooms';
import API from '../../utils/apiRequests';
const tabs = ['Rooms', 'Students', 'Grades', 'Insights', 'Settings'];
class Course extends Component {
  state = {
    activeTab: 'Rooms'
  }

  componentDidMount() {
    // populate the courses data
    console.log(this.props.match.params.id)
    API.getById('course', this.props.match.params.id)
    .then(res => console.log(res))
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
    let activeContent;
    switch (active) {
      case 'Rooms': activeContent = <Rooms />
      // case 'Students': activeContent = <Student />
      // case 'Grades': activeContent = <Settings />;
      // case 'Insights': activeContent = <Insights />;
      // case 'Settings': activeContent = <Settings />;
      default : <Rooms />
    }
    return (
      <section className={classes.Container}>
        <section className={classes.SidePanel}>
          <div className={classes.CourseImage}>Image</div>
          <div className={classes.CourseName}><b>COURSE NAME</b></div>
          <div className={classes.Teachers}>Teacher</div>
          <div className={classes.Description}>Description</div>
        </section>
        <section className={classes.Main}>
          <div className={classes.Tabs}>
            {tabElems}
          </div>
          <div className={classes.MainContent}>
            {activeContent}
          </div>
        </section>
      </section>
    )
  }
}

export default Course;
