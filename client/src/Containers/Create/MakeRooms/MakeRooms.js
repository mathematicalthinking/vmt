import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Aux, Modal } from '../../../Components';
import { Step1, Step2Course, Step2, ParticipantList } from './index';
import createClasses from '../create.css';
import { createRoom } from '../../../store/actions';

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
      selectedParticipants: [],
      roomsCreated: 0,
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
    const {
      dueDate,
      isRandom,
      selectedParticipants,
      roomsCreated,
      remainingParticipants,
      participantsPerRoom,
    } = this.state;
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
      const members = selectedParticipants.map((participant) => ({
        user: participant,
        role: 'participant',
      }));
      members.push({ user: userId, role: 'facilitator' });
      newRoom.name = `${name} (room ${roomsCreated + 1})`;
      newRoom.members = members;
      connectCreateRoom(newRoom);
      const updatedParticipants = remainingParticipants.filter(
        (participant) => {
          if (selectedParticipants.includes(participant.user._id)) {
            return false;
          }
          return true;
        }
      );
      this.setState((prevState) => ({
        selectedParticipants: [],
        roomsCreated: prevState.roomsCreated + 1,
        remainingParticipants: updatedParticipants,
      }));
      if (updatedParticipants.length === 0) {
        close();
        const { url } = match;
        history.push(`${url.slice(0, url.length - 7)}rooms`);
      }
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
      remainingParticipants,
      participantsPerRoom,
      error,
    } = this.state;
    // @TODO STUDENTLIST SHOULD REFLECT THIS.STATE.REMAINING STUDENTS -- RIGHT NOW THERE IS A
    // DISCREPANCY BETWEEN THOSE LISTS AS ONE HOLD IDS AND THE OTHER HOLDS OBJECTS
    const participantList = (
      <ParticipantList
        list={course ? remainingParticipants : []}
        selectedParticipants={selectedParticipants}
        select={this.selectParticipant}
      />
    );

    let CurrentStep = (
      <Step1
        dueDate={dueDate}
        setDueDate={this.setDate}
        nextStep={this.nextStep}
      />
    );

    if (step === 1) {
      if (course) {
        CurrentStep = (
          <Step2Course
            activity={activity}
            participantList={participantList}
            submit={this.submit}
            setRandom={this.setRandom}
            setManual={this.setManual}
            setNumber={this.setNumber}
            participantsPerRoom={participantsPerRoom}
            setParticipantNumber={this.setParticipantNumber}
            isRandom={isRandom}
            error={error}
          />
        );
      } else {
        CurrentStep = (
          <Step2
            activity={activity}
            participantList={participantList}
            userId={userId}
            submit={this.submit}
            select={this.selectParticipant}
            selectedParticipants={selectedParticipants}
          />
        );
      }
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
      <Modal show closeModal={close}>
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
      </Modal>
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
