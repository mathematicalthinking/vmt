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
    roomsCreated: 0,
    remainingStudents: this.props.students,
    dueDate: '',
  }

  setNumber = event => {
    this.setState({studentsPerRoom: event.target.value})
  }

  setDate = event => {
    console.log(event.target.value)
    this.setState({dueDate: event.target.value})
    console.log(this.state)
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
    const { _id, name, description, roomType, tabs, } = this.props.assignment;
    const newRoom = {
      assignment: _id,
      creator: this.props.userId,
      course: this.props.course,
      description,
      roomType,
      tabs,
      dueDate: this.state.dueDate,
    }
    console.log(newRoom.course)
    if (!this.state.assignRandom) {
      // create a room with the selected students
      let members = this.state.selectedStudents.map(student => ({user: student, role: 'Student'}))
      members.push({user: this.props.userId, role: 'Teacher'})
      newRoom.name = `${name} ${this.state.roomsCreated + 1}`;
      newRoom.members = members;
      this.props.createRoom(newRoom)
      const remainingStudents = this.state.remainingStudents.filter(student => {
        if (this.state.selectedStudents.includes(student.user._id)) {
          return false;
        } else return true;
      })
      this.setState(prevState => ({
        selectedStudents: [],
        roomsCreated: prevState.roomsCreated + 1,
        remainingStudents,
      }))
      if (remainingStudents.length === 0) {
        this.props.close();
      }
    }
    else {
      // @TODO IF THIS.STATE.REMAININGSTUDENTS !== THIS.PROPS.STUDENTS THEN WE KNOW
      // THEY ALREADY STARTED ADDING SOME MANUALLY AND NOW ARE TRYING TO ADD THE REST
      // RANDOMLY. WE SHOULD WARN AGAINST THIS
      let { remainingStudents, studentsPerRoom } = {...this.state}
      // @TODO THIS COULD PROBABLY BE OPTIMIZED
      remainingStudents = shuffle(remainingStudents)
      const numRooms = remainingStudents.length/studentsPerRoom
      for (let i = 0; i < numRooms; i++) {
        let members = remainingStudents.splice(0, studentsPerRoom)
        members.push({user: this.props.userId, role: 'Teacher'})
        newRoom.name = `${name} ${this.state.roomsCreated + i + 1}`;
        newRoom.members = members;
        this.props.createRoom(newRoom)
      }
      this.props.close();
    }
  }

  render() {
    // @TODO STUDENTLIST SHOULD REFLECT THIS.STATE.REMAINING STUDENTS -- RIGHT NOW THERE IS A
    // DISCREPANCY BETWEEN THOSE LISTS AS ONE HOLD IDS AND THE OTHER HOLDS OBJECTS
    const studentList = this.state.remainingStudents.map((student, i) => {
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
          <div className={classes.SubContainer}><TextInput label='Due Date' name='dueDate' type='date' change={this.setDate}/></div>
          <div className={classes.Radios}>
            <RadioBtn name='random' checked={this.state.assignRandom} check={() => this.setState({assignRandom: true})}>Assign Randomly</RadioBtn>
            <RadioBtn name='manual' checked={!this.state.assignRandom} check={() => this.setState({assignRandom: false})}>Assign Manually</RadioBtn>
          </div>
          {this.state.assignRandom ?//
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


// @TODO CONSIDER DOING THIS DIFFERENTLY
const shuffle = (array) => {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export default connect(null, mapDispatchToProps)(MakeRooms);
