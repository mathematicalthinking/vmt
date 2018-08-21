import React, { Component } from 'react';
import Button from '../../../Components/UI/Button/Button';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import Aux from '../../../Components/HOC/Auxil';
import RadioBtn from '../../../Components/Form/RadioBtn/RadioBtn';
import classes from './makeRooms.css';
import { connect } from 'react-redux';
import { createRoom } from '../../../store/actions';
class MakeRooms extends Component  {
  state = {
    assignRandom: true,
    studentsPerRoom: 0,
    selectedStudents: [],
    remainingStudents: this.props.students.map(student => student.user._id),
  }

  setNumber = event => {
    this.setState({studentsPerRoom: event.target.value})
  }

  selectStudent = (event, data) => {
    const newStudent = event.target.id;
    let updatedStudents = [...this.state.selectedStudents];
    // if user is in list, remove them.
    if (updatedStudents.includes(newStudent)) {
      updatedStudents = updatedStudents.filter(student => student !== newStudent);
    } else {
      updatedStudents.push(newStudent)
    }
    this.setState({selectedStudents: updatedStudents})
   // Else add them
  }
  submit = () => {
    if (!this.state.assignRandom) {
      // create a room with the selected students
      const { _id, name, description, roomType, tabs, dueDate} = this.props.assignment;
      let members = this.state.selectedStudents.map(student => ({user: student, role: 'Student'}))
      members.push({user: this.props.userId, role: 'Teacher'})
      const newRoom = {
        assignment: _id,
        name,
        description,
        roomType,
        tabs,
        dueDate,
        members,
        creator: this.props.userId,
        course: this.props.course,
      }
      this.props.createRoom(newRoom)
      const remainingStudents = this.state.remainingStudents.filter(student => {
        if (this.state.selectedStudents.includes(student)) {
          return false;
        } else return student;
      })
      this.setState({
        selectedStudents: [],
        remainingStudents,
      })
    } else {

    }
  }

  render() {
    const studentList = this.props.students.map((student, i) => {
      let rowClass = (i%2 === 0) ? [classes.EvenStudent, classes.Student].join(' ') : classes.Student;
      rowClass = this.state.selectedStudents.includes(student.user._id) ? [rowClass, classes.Selected].join(' ') : rowClass;
      return (
        <div
          className={rowClass}
          key={i}
          id={student.user._id}
          onClick={this.selectStudent}
        >{i+1}. {student.user.username}</div>)
    })
    return (
      <Aux>
        <div className={classes.Container}>
          <h2>Assign Rooms</h2>
          <div className={classes.Radios}>
            <RadioBtn name='random' checked={this.state.assignRandom} check={() => this.setState({assignRandom: true})}>Assign Randomly</RadioBtn>
            <RadioBtn name='manual' checked={!this.state.assignRandom} check={() => this.setState({assignRandom: false})}>Assign Manually</RadioBtn>
          </div>
          {this.state.assignRandom ?
            <div className={classes.SubContainer}>
              <TextInput label='Number of students per room' type='number' change={this.setNumber}/>
            </div> :
            <div className={classes.SubContainer}>
              <div className={classes.StudentList}>
                {studentList}
              </div>
            </div>
          }
          <Button click={this.submit}>Assign</Button>
        </div>
      </Aux>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  createRoom: room => dispatch(createRoom(room)),
})
export default connect(null, mapDispatchToProps)(MakeRooms);
