import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import NewRoom from './NewRoom/NewRoom';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import Filter from '../../Components/UI/Button/Filter/Filter';
import classes from './courses.css';
import glb from '../../global.css';
import * as actions from '../../store/actions/';
import { connect } from 'react-redux';

class Courses extends Component {
  // local state describing which courses should be displayed
  // all, or just the user's
  state = {
    allCourses: true,
  }
  componentDidMount() {
    console.log('rerender of courses triggered')
    // only dispatch action if we need to
    if (!this.props.courses.length) {
      this.props.getCourses();
    }
  }

  filter = event => {
    event.preventDefault();
    const allCourses = this.state.allCourses;
    this.setState({allCourses: !allCourses})
  }

  render() {
    const courses = this.state.allCourses ? 'courses' : 'myCourses';
    const roomElems = this.props[courses].map((room, i) => (
      <ContentBox title={
        <Link className={glb.Link} to={`/room/${room._id}`}>{room.roomName}</Link>} key={i}>
        {/* room info */}
      </ContentBox>
    ))
    return (
      <div>
        <div>
          {(this.props.match.path === '/courses/new') ?
            <NewRoom
              createRoom={this.props.createRoom}
              userId={this.props.userId}
              updateUserCourses={this.props.updateUserCourses}
            /> : null}
        </div>
        <div>
          <div className={classes.Filters}>
            <Filter click={this.filter} on={this.state.allCourses}>
              {this.state.allCourses ? 'Show courses created by me' : 'Show public courses'}
            </Filter>
          </div>
          <div className={classes.Container}>{roomElems}</div>
        </div>
      </div>
    )
  }
}

// connect react functions to redux actions
const mapDispatchToProps = dispatch => {
  return {
    getCourses: () => dispatch(actions.getCourses()),
    createRoom: body => dispatch(actions.createRoom(body)),
    updateUserCourses: newRoom => dispatch(actions.updateUserCourses(newRoom)),
  }
}

// connect redux store to react props
const mapStateToProps = store => {
  return {
    courses: store.coursesReducer.courses,
    myCourses: store.userReducer.myCourses,
    username: store.userReducer.username,
    userId: store.userReducer.userId
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Courses);
