import React, { Component } from 'react';
import Filter from '../../Components/UI/Button/Filter/Filter';
import Button from '../../Components/UI/Button/Button';
import NewResource from '../Create/NewResource/NewResource';
import classes from './assignments.css';
import glb from '../../global.css';
// import Dropdown from '../../Components/UI/Dropdown/Dropdown';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import * as actions from '../../store/actions';
import { connect } from 'react-redux';
class Assignments extends Component {
  state = {

  }

  render() {
    return (
      <div>
        <NewResource resource='assignment' />
      </div>
    )
  }
}

const mapStateToProps = store => ({
  // rooms: store.rooms
})

// connect react functions to redux actions
const mapDispatchToProps = dispatch => {
  return {
    getCourses: () => dispatch(actions.getCourses()),
    getRooms: () => dispatch(actions.getRooms()),
    // updateUserCourses: newCourse => dispatch(actions.updateUserCourses(newCourse)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Assignments);
