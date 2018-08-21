import React, { Component } from 'react';
import Button from '../../../Components/UI/Button/Button';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import Aux from '../../../Components/HOC/Auxil';
import RadioBtn from '../../../Components/Form/RadioBtn/RadioBtn';
import classes from './makeRooms.css';
class MakeRooms extends Component  {
  state = {
    assignRandom: true,
    studentsPerRoom: 0,
    selectedStudents: [],
  }

  setNumber = event => {
    this.setState({studentsPerRoom: event.target.value})
  }

  selectStudent = (event, data) => {
    console.log(event.target.id)
    const newStudent = event.target.id;
    let updatedStudents = [...this.state.selectedStudents];
    // if user is in list, remove them.
    if (updatedStudents.includes(newStudent)) {
      updatedStudents = updatedStudents.filter(student => student !== newStudent);
    } else {
      updatedStudents.push(newStudent)
    }
    console.log(updatedStudents)
    this.setState({selectedStudents: updatedStudents})
   // Else add them
  }
  submit = () => {

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
          <Button>Assign</Button>
        </div>
      </Aux>
    )
  }
}

export default MakeRooms;
