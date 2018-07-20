import React, { Component } from 'react';
import classes from './course.css';

class Course extends Component {
  render() {
    return (
      <section className={classes.Container}>
        <section className={classes.SidePanel}>
          <div className={classes.CourseImage}>Image</div>
          <div className={classes.CourseName}><b>NAME</b></div>
          <div className={classes.Teachers}>Teacher</div>
          <div className={classes.Description}>Description</div>
        </section>
        <section className={classes.Main}>
          <div className={classes.Tabs}>
            <div className={[classes.Tab, classes.ActiveTab].join(' ')}>Rooms</div>
            <div className={classes.Tab}>Students</div>
            <div className={classes.Tab}>Settings</div>
          </div>
          <div className={classes.MainContent}>Content</div>
        </section>
      </section>
    )
  }
}

export default Course;
