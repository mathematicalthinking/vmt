import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Button from '../../../Components/UI/Button/Button';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import Aux from '../../../Components/HOC/Auxil';
import RadioBtn from '../../../Components/Form/RadioBtn/RadioBtn';
import classes from './makeRooms.css';
import { createRoom } from '../../../store/actions';
class MakeRooms extends Component  {
  state = {
    assignRandom: true,
    participantsPerRoom: 0,
    selectedParticipants: [],
    roomsCreated: 0,
    remainingParticipants: this.props.participants,
    dueDate: '',
  }

  componentDidMount() {
    window.addEventListener('keypress', this.onKeyPress)
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this.onKeyPress)
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.submit()
    }
  }

  setNumber = event => {
    this.setState({participantsPerRoom: event.target.value})
  }

  setDate = event => {
    this.setState({dueDate: event.target.value})
  }

  selectParticipant = (event, data) => {
    let newParticipant = event.target.id;
    let updatedParticipants = [...this.state.selectedParticipants];
    // if user is in list, remove them.
    if (updatedParticipants.includes(newParticipant)) {
      updatedParticipants = updatedParticipants.filter(participant => participant !== newParticipant);
    } else {
      updatedParticipants.push(newParticipant)
    }
    this.setState({selectedParticipants: updatedParticipants})
   // Else add them
  }

  // NOW THAT WE HAVE A CREATEROOMFROMACTIVITY ACTION THINK ABOUT REFACTORING ALL OF THIS
  // TO UTILIZE THAT FUNCTIONALITY
  submit = () => {
    let { _id, name, description, roomType, desmosLink, ggbFile, image, instructions, tabs, } = this.props.activity;
    let newRoom = {
      activity: _id,
      creator: this.props.userId,
      course: this.props.course,
      description,
      roomType,
      desmosLink,
      ggbFile,
      instructions,
      dueDate: this.state.dueDate,
      image,
      tabs,
    }
    if (!this.state.assignRandom) {
      // create a room with the selected participants
      let members = this.state.selectedParticipants.map(participant => ({user: participant, role: 'participant'}))
      members.push({user: this.props.userId, role: 'facilitator'})
      newRoom.name = `${name} (room ${this.state.roomsCreated + 1})`;
      newRoom.members = members;
      console.log('CREATING NEW ROOM: ')
      console.log(newRoom)
      this.props.createRoom(newRoom)

      let remainingParticipants = this.state.remainingParticipants.filter(participant => {
        if (this.state.selectedParticipants.includes(participant.user._id)) {
          return false;
        } else return true;
      })
      this.setState(prevState => ({
        selectedParticipants: [],
        roomsCreated: prevState.roomsCreated + 1,
        remainingParticipants,
      }))
      if (remainingParticipants.length === 0) {
        this.props.close();
        let { url } = this.props.match;
        this.props.history.push(`${url.slice(0, url.length - 7)}rooms`)
      }
    }
    else {
      // @TODO IF THIS.STATE.REMAININGSTUDENTS !== THIS.PROPS.STUDENTS THEN WE KNOW
      // THEY ALREADY STARTED ADDING SOME MANUALLY AND NOW ARE TRYING TO ADD THE REST
      // RANDOMLY. WE SHOULD WARN AGAINST THIS
      let { remainingParticipants, participantsPerRoom } = {...this.state}
      // @TODO THIS COULD PROBABLY BE OPTIMIZED
      remainingParticipants = shuffle(remainingParticipants)
      let numRooms = remainingParticipants.length/participantsPerRoom
      for (let i = 0; i < numRooms; i++) {
        let members = remainingParticipants.splice(0, participantsPerRoom)
        members.push({user: this.props.userId, role: 'facilitator'})
        newRoom.name = `${name} ${this.state.roomsCreated + i + 1}`;
        newRoom.members = members;
        this.props.createRoom(newRoom)
      }
      this.props.close();
      let { url } = this.props.match;
      this.props.history.push(`${url.slice(0, url.length - 7)}rooms`)
    }
  }

  render() {
    // @TODO STUDENTLIST SHOULD REFLECT THIS.STATE.REMAINING STUDENTS -- RIGHT NOW THERE IS A
    // DISCREPANCY BETWEEN THOSE LISTS AS ONE HOLD IDS AND THE OTHER HOLDS OBJECTS
    let participantList = this.state.remainingParticipants.map((participant, i) => {
      let rowClass = (i%2 === 0) ? [classes.EvenParticipant, classes.Participant].join(' ') : classes.Participant;
      rowClass = this.state.selectedParticipants.includes(participant.user._id) ? [rowClass, classes.Selected].join(' ') : rowClass;
      return (
        <div
          className={rowClass}
          key={i}
          id={participant.user._id}
          onClick={this.selectParticipant}
        >{i+1}. {participant.user.username}</div>)
    })
    return (
      <Aux>
        <div className={classes.Container}>
          <h2 className={classes.Title}>Assign Rooms</h2>
          <div className={classes.SubContainer}><TextInput light label='Due Date' name='dueDate' type='date' change={this.setDate}/></div>
          <div className={classes.Radios}>
            <RadioBtn name='random' checked={this.state.assignRandom} check={() => this.setState({assignRandom: true})}>Assign Randomly</RadioBtn>
            <RadioBtn name='manual' checked={!this.state.assignRandom} check={() => this.setState({assignRandom: false})}>Assign Manually</RadioBtn>
          </div>
          {this.state.assignRandom ?//
            <div className={classes.SubContainer}>
              <TextInput light label='Number of participants per room' type='number' change={this.setNumber}/>
            </div> :
            <div className={classes.SubContainer}>
              <div className={classes.ParticipantList}>
                {participantList}
              </div>
            </div>
          }
          <div className={classes.Button}>
            <Button m={5} click={this.submit} data-testid="assign-rooms">Assign</Button>
          </div>
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

export default withRouter(connect(null, mapDispatchToProps)(MakeRooms));
