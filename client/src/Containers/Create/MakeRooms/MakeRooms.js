import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Aux, BigModal } from 'Components';
import { Step1, Step2Course, ParticipantList } from './index';
import createClasses from '../create.css';
import { createRoom } from '../../../store/actions';
import AssignmentMatrix from './AssignmentMatrix';

// @TODO CONSIDER DOING THIS DIFFERENTLY
const shuffle = (array) => {
  const arrayCopy = [...array];
  // const currentIndex = arrayCopy.length,
  //   temporaryValue,
  //   randomIndex;

  // // While there remain elements to shuffle...
  // while (0 !== currentIndex) {
  //   // Pick a remaining element...
  //   randomIndex = Math.floor(Math.random() * currentIndex);
  //   currentIndex -= 1;

  //   // And swap it with the current element.
  //   temporaryValue = array[currentIndex];
  //   arrayCopy[currentIndex] = array[randomIndex];
  //   arrayCopy[randomIndex] = temporaryValue;
  // }

  return arrayCopy;
};

class MakeRooms extends Component {
  constructor(props) {
    super(props);
    const { participants } = this.props;
    this.state = {
      isRandom: false,
      participantsPerRoom: 0,
      roomNum: 1,
      selectedParticipants: [],
      roomDrafts: [],
      // roomsCreated: 0,
      remainingParticipants: participants,
      dueDate: null,
      error: null,
      step: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('keypress', this.onKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this.onKeyPress);
  }

  onKeyPress = (event) => {
    const { step } = this.state;
    if (event.key === 'Enter') {
      if (step < 1) {
        this.nextStep();
      } else {
        this.submit();
      }
    }
  };

  setRandom = () => this.setState({ isRandom: true });

  setManual = () => this.setState({ isRandom: false });

  setParticipantNumber = (event) =>
    this.setState({ participantsPerRoom: event.target.value });

  setRoomNumber = (event) => {
    const number = +event.target.value;
    if (number === 0) this.setState({ roomNum: '' });
    if (number > 0 && number < 8) {
      this.setState({ roomNum: number, error: null });
    } else {
      this.setState({
        error: 'Please create between 1 and 7 rooms',
      });
    }
  };

  setNumber = (event) => {
    this.setState({
      participantsPerRoom: event.target.value.trim(),
      error: null,
    });
  };

  setDate = (event) => {
    this.setState({ dueDate: event });
  };

  nextStep = () => {
    this.setState((prevState) => ({
      step: prevState.step + 1,
    }));
  };

  prevStep = () => {
    this.setState((prevState) => ({
      step: prevState.step - 1,
    }));
  };

  selectParticipant = (event, userId) => {
    const { selectedParticipants } = this.state;
    const newParticipant = userId;
    let updatedSelectedParticipants = [...selectedParticipants];
    // if user is already selected, remove them from the selected lis
    if (selectedParticipants.includes(newParticipant)) {
      updatedSelectedParticipants = selectedParticipants.filter(
        (participant) => participant !== newParticipant
      );
      // updatedRemainingParticipants.push()
      // if the user is not already selected, add them to selected and remove from remaining
    } else {
      updatedSelectedParticipants.push(newParticipant);
    }
    this.setState({
      selectedParticipants: updatedSelectedParticipants,
    });
    // Else add them
  };

  setParticipants = (event, user) => {
    const { selectedParticipants } = this.state;
    let updatedParticpants = [...selectedParticipants];
    if (
      selectedParticipants.findIndex((userObj) => userObj.id === user._id) > -1
    ) {
      updatedParticpants = selectedParticipants.filter(
        (participant) => participant !== user
      );
      // updatedRemainingParticipants.push()
      // if the user is not already selected, add them to selected and remove from remaining
    } else {
      updatedParticpants.push(user);
    }
    this.setState({
      selectedParticipants: updatedParticpants,
    });
  };

  updateParticipants = (selectionMatrix) => {
    const { roomNum } = this.state;
    console.log('Passed matrix: ', selectionMatrix, ' Room num: ', roomNum);
    this.setState({ roomDrafts: selectionMatrix });
  };

  // NOW THAT WE HAVE A CREATEROOMFROMACTIVITY ACTION THINK ABOUT REFACTORING ALL OF THIS
  // TO UTILIZE THAT FUNCTIONALITY
  submit = () => {
    const {
      activity,
      userId,
      course,
      connectCreateRoom,
      close,
      history,
      match,
      participants,
    } = this.props;
    const { dueDate, isRandom, roomDrafts, participantsPerRoom } = this.state;
    const {
      _id,
      name,
      description,
      roomType,
      desmosLink,
      ggbFile,
      image,
      instructions,
      tabs,
    } = activity;
    const newRoom = {
      activity: _id,
      creator: userId,
      course,
      description,
      roomType,
      desmosLink,
      ggbFile,
      instructions,
      dueDate,
      image,
      tabs,
    };
    if (!isRandom) {
      // create a room with the selected participants
      const roomsToCreate = [];
      for (let i = 0; i < roomDrafts.length; i++) {
        // const currentRoom = { ...roomDrafts[i] };
        const currentRoom = { ...newRoom };
        const members = roomDrafts[i].members.map((id) => ({
          user: id,
          role: 'participant',
        }));
        members.push({ user: userId, role: 'facilitator' });
        currentRoom.members = members;
        currentRoom.name = roomDrafts[i].name;
        currentRoom.activity = roomDrafts[i].activity;
        currentRoom.course = roomDrafts[i].course;
        roomsToCreate.push(currentRoom);
      }
      console.log('Room assignment rooms: ', roomsToCreate);
      roomsToCreate.forEach((room) => connectCreateRoom(room));
      close();
      const { url } = match;
      history.push(`${url.slice(0, url.length - 7)}rooms`);
    } else if (
      parseInt(participantsPerRoom, 10) <= 0 ||
      Number.isNaN(parseInt(participantsPerRoom, 10))
    ) {
      this.setState({
        error: 'Please enter the number of participants per room',
      });
    } else {
      // Is Random assignment
      // @TODO THIS COULD PROBABLY BE OPTIMIZED - currently broken
      const updatedParticipants = shuffle(participants);
      const numRooms = updatedParticipants.length / participantsPerRoom;
      const roomsToCreate = [];
      for (let i = 0; i < numRooms; i++) {
        if (updatedParticipants.length < 1) break;
        const currentRoom = { ...newRoom };
        const members = updatedParticipants
          .slice(0, participantsPerRoom)
          .map((participant) => ({
            user: participant.user._id,
            role: 'participant',
          }));
        updatedParticipants.splice(0, participantsPerRoom);
        if (updatedParticipants.length === 1)
          members.push({
            user: updatedParticipants[0].user._id,
            role: 'participant',
          });
        members.push({ user: userId, role: 'facilitator' });
        currentRoom.name = `${name} (CourseID:${course.slice(-5)}, room ${i +
          1})`;
        currentRoom.members = members;
        roomsToCreate.push(currentRoom);
      }
      console.log('Random Room assignment rooms: ', roomsToCreate);
      roomsToCreate.forEach((room) => connectCreateRoom(room));
      close();
      const { url } = match;
      history.push(`${url.slice(0, url.length - 7)}rooms`);
    }
  };

  render() {
    const { activity, course, userId, close } = this.props;
    const {
      step,
      dueDate,
      isRandom,
      selectedParticipants,
      roomNum,
      remainingParticipants,
      participantsPerRoom,
      error,
    } = this.state;
    // @TODO STUDENTLIST SHOULD REFLECT THIS.STATE.REMAINING STUDENTS -- RIGHT NOW THERE IS A
    // DISCREPANCY BETWEEN THOSE LISTS AS ONE HOLD IDS AND THE OTHER HOLDS OBJECTS
    const participantList = (
      <ParticipantList
        list={course ? remainingParticipants : selectedParticipants}
        selectedParticipants={selectedParticipants}
        select={this.setParticipants}
      />
    );
    const assignmentMatrix = (
      <AssignmentMatrix
        list={course ? remainingParticipants : selectedParticipants}
        selectedParticipants={selectedParticipants}
        select={this.updateParticipants}
        roomNum={roomNum}
        activity={activity}
        course={course}
        dueDate={dueDate}
      />
    );

    let CurrentStep = (
      <Step1
        dueDate={dueDate}
        setDueDate={this.setDate}
        nextStep={this.nextStep}
        participantList={participantList}
        userId={userId}
        select={this.selectParticipant}
        course={course}
        selectedParticipants={selectedParticipants}
      />
    );

    if (step === 1) {
      // if (course) {
      CurrentStep = (
        <Step2Course
          activity={activity}
          participantList={participantList}
          assignmentMatrix={assignmentMatrix}
          submit={this.submit}
          setRandom={this.setRandom}
          setManual={this.setManual}
          setNumber={this.setNumber}
          participantsPerRoom={participantsPerRoom}
          roomNum={roomNum}
          setRoomNumber={this.setRoomNumber}
          setParticipantNumber={this.setParticipantNumber}
          isRandom={isRandom}
          error={error}
        />
      );
      // } else {
      //   CurrentStep = (
      //     <Step2
      //       activity={activity}
      //       participantList={participantList}
      //       userId={userId}
      //       submit={this.submit}
      //       select={this.selectParticipant}
      //       selectedParticipants={selectedParticipants}
      //     />
      //   );
      // }
    }
    const stepDisplays = [];
    for (let i = 0; i < 2; i++) {
      stepDisplays.push(
        <div
          key={`step-${i}`}
          className={[
            createClasses.Step,
            i <= step ? createClasses.CompletedStep : null,
          ].join(' ')}
        />
      );
    }

    return (
      <BigModal show closeModal={close} height="65%">
        <Aux>
          {step > 0 ? (
            <i
              onClick={this.prevStep}
              onKeyPress={this.prevStep}
              role="button"
              tabIndex="-1"
              className={['fas', 'fa-arrow-left', createClasses.BackIcon].join(
                ' '
              )}
            />
          ) : null}
          {CurrentStep}
          <div className={createClasses.StepDisplayContainer}>
            {stepDisplays}
          </div>
        </Aux>
      </BigModal>
    );
  }
}

MakeRooms.propTypes = {
  participants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  activity: PropTypes.shape({}).isRequired,
  userId: PropTypes.string.isRequired,
  course: PropTypes.string,
  close: PropTypes.func.isRequired,
  history: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
  connectCreateRoom: PropTypes.func.isRequired,
};

MakeRooms.defaultProps = {
  course: null,
};
const mapDispatchToProps = (dispatch) => ({
  connectCreateRoom: (room) => dispatch(createRoom(room)),
});

export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(MakeRooms)
);
