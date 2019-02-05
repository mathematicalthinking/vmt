import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Checkbox, Aux, Modal } from "../../../Components";
import { Step1, Step2Course, Step2, ParticipantList } from "./index";
import classes from "./makeRooms.css";
import createClasses from "../create.css";
import { createRoom } from "../../../store/actions";

class MakeRooms extends Component {
  state = {
    assignRandom: false,
    participantsPerRoom: 0,
    selectedParticipants: [],
    roomsCreated: 0,
    remainingParticipants: this.props.participants,
    dueDate: "",
    error: null,
    step: 0
  };

  componentDidMount() {
    window.addEventListener("keypress", this.onKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener("keypress", this.onKeyPress);
  }

  onKeyPress = event => {
    if (event.key === "Enter") {
      if (this.state.step < 1) {
        this.nextStep();
      } else {
        this.submit();
      }
    }
  };

  setRandom = () => this.setState({ assignRandom: true });

  setManual = () => this.setState({ assignRandom: false });

  setParticipantNumber = event =>
    this.setState({ participantsPerRoom: event.target.value });

  setNumber = event => {
    this.setState({
      participantsPerRoom: event.target.value.trim(),
      error: null
    });
  };

  setDate = event => {
    this.setState({ dueDate: event.target.value });
  };

  nextStep = () => {
    this.setState(prevState => ({
      step: prevState.step + 1
    }));
  };

  prevStep = () => {
    this.setState(prevState => ({
      step: prevState.step - 1
    }));
  };

  selectParticipant = (event, userId) => {
    let newParticipant = userId;
    let updatedParticipants = [...this.state.selectedParticipants];
    // if user is in list, remove them.
    if (updatedParticipants.includes(newParticipant)) {
      updatedParticipants = updatedParticipants.filter(
        participant => participant !== newParticipant
      );
    } else {
      updatedParticipants.push(newParticipant);
    }
    this.setState({ selectedParticipants: updatedParticipants });
    // Else add them
  };

  // NOW THAT WE HAVE A CREATEROOMFROMACTIVITY ACTION THINK ABOUT REFACTORING ALL OF THIS
  // TO UTILIZE THAT FUNCTIONALITY
  submit = () => {
    let {
      _id,
      name,
      description,
      roomType,
      desmosLink,
      ggbFile,
      image,
      instructions,
      tabs
    } = this.props.activity;
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
      tabs
    };
    if (!this.state.assignRandom) {
      // create a room with the selected participants
      let members = this.state.selectedParticipants.map(participant => ({
        user: participant,
        role: "participant"
      }));
      members.push({ user: this.props.userId, role: "facilitator" });
      newRoom.name = `${name} (room ${this.state.roomsCreated + 1})`;
      newRoom.members = members;
      console.log(members);
      this.props.createRoom(newRoom);
      console.log("created room");
      let remainingParticipants = this.state.remainingParticipants.filter(
        participant => {
          if (this.state.selectedParticipants.includes(participant.user._id)) {
            return false;
          } else return true;
        }
      );
      this.setState(prevState => ({
        selectedParticipants: [],
        roomsCreated: prevState.roomsCreated + 1,
        remainingParticipants
      }));
      if (remainingParticipants.length === 0) {
        this.props.close();
        let { url } = this.props.match;
        this.props.history.push(`${url.slice(0, url.length - 7)}rooms`);
      }
    } else {
      if (
        parseInt(this.state.participantsPerRoom, 10) <= 0 ||
        isNaN(parseInt(this.state.participantsPerRoom, 10))
      ) {
        return this.setState({
          error: "Please enter the number of participants per room"
        });
      }
      // @TODO IF THIS.STATE.REMAININGSTUDENTS !== THIS.PROPS.STUDENTS THEN WE KNOW
      // THEY ALREADY STARTED ADDING SOME MANUALLY AND NOW ARE TRYING TO ADD THE REST
      // RANDOMLY. WE SHOULD WARN AGAINST THIS
      let { remainingParticipants, participantsPerRoom } = this.state;
      // @TODO THIS COULD PROBABLY BE OPTIMIZED
      remainingParticipants = shuffle(remainingParticipants);
      let numRooms = remainingParticipants.length / participantsPerRoom;
      let roomsToCreate = [];
      for (let i = 0; i < numRooms; i++) {
        let currentRoom = { ...newRoom };
        let members = remainingParticipants
          .splice(0, participantsPerRoom)
          .map(participant => ({
            user: participant.user._id,
            role: "participant"
          }));
        members.push({ user: this.props.userId, role: "facilitator" });
        currentRoom.name = `${name} (room ${i + 1})`;
        currentRoom.members = members;
        roomsToCreate.push(currentRoom);
      }
      roomsToCreate.forEach(room => this.props.createRoom(room));
      this.props.close();
      let { url } = this.props.match;
      this.props.history.push(`${url.slice(0, url.length - 7)}rooms`);
    }
  };

  render() {
    let { activity, course } = this.props;
    // @TODO STUDENTLIST SHOULD REFLECT THIS.STATE.REMAINING STUDENTS -- RIGHT NOW THERE IS A
    // DISCREPANCY BETWEEN THOSE LISTS AS ONE HOLD IDS AND THE OTHER HOLDS OBJECTS
    let participantList;
    if (course) {
      participantList = (
        <ParticipantList
          list={this.state.remainingParticipants}
          selectedParticipants={this.state.selectedParticipants}
          select={this.selectParticipant}
        />
      );
    } else {
      participantList = [];
    }

    let CurrentStep = (
      <Step1
        dueDate={this.state.dueDate}
        setDate={this.setDate}
        nextStep={this.nextStep}
      />
    );

    if (this.state.step === 1) {
      console.log("activitCOURSE", course);
      if (course) {
        CurrentStep = (
          <Step2Course
            activity={activity}
            participantList={participantList}
            submit={this.submit}
            setRandom={this.setRandom}
            setManual={this.setManual}
            participantsPerRoom={this.state.participantsPerRoom}
            setParticipantNumber={this.setParticipantNumber}
            assignRandom={this.state.assignRandom}
            error={this.state.error}
          />
        );
      } else {
        CurrentStep = (
          <Step2
            activity={activity}
            participantList={participantList}
            userId={this.props.userId}
            submit={this.submit}
            select={this.selectParticipant}
            selectedParticipants={this.state.selectedParticipants}
          />
        );
      }
    }
    let stepDisplays = [];
    for (let i = 0; i < 2; i++) {
      stepDisplays.push(
        <div
          key={`step-${i}`}
          className={[
            createClasses.Step,
            i <= this.state.step ? createClasses.CompletedStep : null
          ].join(" ")}
        />
      );
    }

    return (
      <Modal show={true} closeModal={this.props.close}>
        <Aux>
          {this.state.step > 0 ? (
            <i
              onClick={this.prevStep}
              className={["fas", "fa-arrow-left", createClasses.BackIcon].join(
                " "
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

const mapDispatchToProps = dispatch => ({
  createRoom: room => dispatch(createRoom(room))
});

// @TODO CONSIDER DOING THIS DIFFERENTLY
const shuffle = array => {
  let arrayCopy = [...array];
  let currentIndex = arrayCopy.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    arrayCopy[currentIndex] = array[randomIndex];
    arrayCopy[randomIndex] = temporaryValue;
  }

  return arrayCopy;
};

export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(MakeRooms)
);
