import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Aux, BigModal } from 'Components';
import { Step1, Step2Course, ParticipantList } from './index';
import createClasses from '../create.css';
import { createRoom } from '../../../store/actions';
import AssignmentMatrix from './AssignmentMatrix';
import COLOR_MAP from '../../../utils/colorMap';

class MakeRooms extends Component {
  constructor(props) {
    super(props);
    const { participants, activity } = this.props;
    this.state = {
      isRandom: true,
      participantsPerRoom: 3,
      roomNum: 1,
      roomName: activity.name || '',
      selectedParticipants: [...participants].sort((a) =>
        a.role === 'facilitator' ? 1 : -1
      ),
      roomDrafts: [],
      dueDate: null,
      error: null,
      step: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('keypress', this.onKeyPress);

    const { selectedParticipants, isRandom, participantsPerRoom } = this.state;

    if (isRandom) {
      const numRooms = Math.ceil(
        this.filterFacilitators(selectedParticipants).length /
          participantsPerRoom
      );
      this.setRoomNumber(numRooms);
    }
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

  setRandom = () => {
    // const { participants } = this.props;
    const {
      selectedParticipants: participants,
      participantsPerRoom,
    } = this.state;
    this.setState({ isRandom: true }, () => {
      const numRooms = Math.ceil(
        this.filterFacilitators(participants).length / participantsPerRoom
      );
      this.setRoomNumber(numRooms);
    });
  };

  setManual = () =>
    this.setState({ isRandom: false }, () => {
      this.setRoomNumber(1);
    });

  setParticipantNumber = (event) =>
    this.setState({ participantsPerRoom: parseInt(event.target.value, 10) });

  setRoomNumber = (number) => {
    if (number > 0) {
      this.setState({ roomNum: number, error: null });
    } else {
      this.setState({
        roomNum: 1,
        error: 'Please create at least 1 room',
      });
    }
  };

  setRoomName = (newRoomName) => {
    if (newRoomName.length > 0) {
      this.setState({ roomName: newRoomName, error: '' });
    } else {
      this.setState({
        roomName: '',
        error: 'Please provide a room name',
      });
    }
  };

  setNumber = (event) => {
    // const { participants } = this.props;
    const { selectedParticipants: participants, isRandom } = this.state;
    const participantsPerRoom = parseInt(event.target.value.trim(), 10);
    if (participantsPerRoom < 1) {
      this.setState({
        participantsPerRoom: 1,
        error: 'Must have at least 1 participant per room',
      });
    } else if (participantsPerRoom > participants.length) {
      this.setState({
        participantsPerRoom: participants.length,
        error: 'Maximum number of participants reached',
      });
    } else {
      this.setState(
        {
          participantsPerRoom,
          error: null,
        },
        () => {
          if (isRandom) {
            const numRooms = Math.ceil(
              this.filterFacilitators(participants).length / participantsPerRoom
            );
            this.setRoomNumber(numRooms);
          }
        }
      );
    }
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
    const _updateParticipantList = (selectedParticipants) => {
      const newParticipant = userId;
      let updatedSelectedParticipants = [...selectedParticipants];
      // if user is already selected, remove them from the selected list
      if (
        selectedParticipants.some((mem) => {
          return mem.user._id === newParticipant.user._id;
        })
      ) {
        updatedSelectedParticipants = selectedParticipants.filter(
          (participant) => participant !== newParticipant
        );
        // if the user is not already selected, add them to selected and remove from remaining
      } else {
        updatedSelectedParticipants.push(newParticipant);
      }
      return updatedSelectedParticipants;
    };

    this.setState(
      (previousState) => ({
        selectedParticipants: _updateParticipantList(
          previousState.selectedParticipants
        ),
      }),
      () => {
        const {
          isRandom,
          participantsPerRoom,
          selectedParticipants,
        } = this.state;
        if (isRandom) {
          const numRooms = Math.ceil(
            this.filterFacilitators(selectedParticipants).length /
              participantsPerRoom
          );
          this.setRoomNumber(numRooms);
        }
      }
    );
    // Else add them
  };

  setParticipants = (event, user) => {
    const _updateParticipantsList = (selectedParticipants) => {
      let updatedParticpants = [...selectedParticipants];
      if (
        selectedParticipants.findIndex((userObj) => userObj.id === user._id) >
        -1
      ) {
        updatedParticpants = selectedParticipants.filter(
          (participant) => participant !== user
        );
        // if the user is not already selected, add them to selected and remove from remaining
      } else {
        updatedParticpants.push(user);
      }
      return updatedParticpants;
    };

    this.setState(
      (previousState) => ({
        selectedParticipants: _updateParticipantsList(
          previousState.selectedParticipants
        ),
      }),
      () => {
        const {
          isRandom,
          participantsPerRoom,
          selectedParticipants,
        } = this.state;
        if (isRandom) {
          const numRooms = Math.ceil(
            this.filterFacilitators(selectedParticipants).length /
              participantsPerRoom
          );
          this.setRoomNumber(numRooms);
        }
      }
    );
  };

  updateParticipants = (selectionMatrix) => {
    this.setState({ roomDrafts: selectionMatrix });
  };

  resetParticipants = (roomsArray) => {
    return roomsArray.map((roomArray) => {
      const newMems = roomArray.members.filter(
        (mem) => mem.role === 'facilitator'
      );
      return { ...roomArray, members: newMems };
    });
  };

  shuffleUserList = (array) => {
    // random number between 0 - array.length
    // take first index and switch with random index
    const arrayCopy = [...array];
    arrayCopy.forEach((elem, index) => {
      const randomIndex = Math.floor(Math.random() * array.length);
      arrayCopy[index] = arrayCopy[randomIndex];
      arrayCopy[randomIndex] = elem;
    });
    return arrayCopy;
  };

  filterFacilitators = (membersArray) => {
    // return roomsArray.map((roomArray) => {
    return membersArray.filter((mem) => mem.role !== 'facilitator');
    // return { ...roomArray, members: newMems };
    // });
  };

  restructureMemberlist = (list) => {
    return list.map((mem) => {
      const user = {
        role: mem.role || 'participant',
        _id: mem.user._id,
      };
      return user;
    });
  };

  shuffleParticipants = () => {
    // const { participants } = this.props;
    const {
      selectedParticipants: participants,
      participantsPerRoom,
      roomDrafts,
    } = this.state;
    if (participantsPerRoom < 1) {
      this.setState({
        error: 'Must have at least 1 participant per room',
      });
    } else {
      const updatedParticipants = this.shuffleUserList(
        this.restructureMemberlist(this.filterFacilitators(participants))
      );

      const numRooms = Math.ceil(
        updatedParticipants.length / participantsPerRoom
      );

      const roomsUpdate = this.resetParticipants([...roomDrafts]);

      const partcipantsToAssign = [...updatedParticipants];
      for (let i = 0; i < numRooms; i++) {
        if (roomsUpdate[i]) {
          roomsUpdate[i].members = [
            ...roomsUpdate[i].members,
            ...partcipantsToAssign.splice(0, participantsPerRoom),
          ];
        }
      }

      this.setState({
        roomDrafts: roomsUpdate,
      });
    }
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
    } = this.props;
    const { dueDate, roomDrafts, roomName } = this.state;
    const {
      _id,
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
    // if (!isRandom) {
    // create a room with the selected participants
    const roomsToCreate = [];
    const date = dueDate ? new Date(dueDate) : new Date();
    const dateStamp = `${date.getMonth() + 1}-${date.getDate()}`;
    for (let i = 0; i < roomDrafts.length; i++) {
      // const currentRoom = { ...roomDrafts[i] };
      const currentRoom = { ...newRoom };
      const members = roomDrafts[i].members.map((mem, index) => ({
        user: course ? mem._id : mem,
        role: mem.role,
        color: course ? COLOR_MAP[index] : COLOR_MAP[index + 1],
      }));
      if (!course) {
        members.unshift({
          user: userId,
          role: 'facilitator',
          color: COLOR_MAP[0],
        });
      }
      currentRoom.members = members;
      //   currentRoom.name = roomDrafts[i].name;
      currentRoom.name = `${roomName} (${dateStamp}): ${i + 1}`;
      currentRoom.activity = roomDrafts[i].activity;
      currentRoom.course = roomDrafts[i].course;
      roomsToCreate.push(currentRoom);
    }
    if (roomDrafts.length === 0) {
      // create a room with just the facilitator
      const currentRoom = { ...newRoom };
      const members = [];
      members.push({ user: userId, role: 'facilitator' });
      currentRoom.members = members;
      // //   currentRoom.name = `${activity.name} room copy`;
      currentRoom.name = `${roomName} (${dateStamp})`;
      roomsToCreate.push(currentRoom);
    }
    roomsToCreate.forEach((room) => connectCreateRoom(room));
    close();
    const { url } = match;
    history.push(`${url.slice(0, url.length - 7)}rooms`);
  };

  render() {
    const { activity, course, userId, close } = this.props;
    const {
      step,
      dueDate,
      isRandom,
      selectedParticipants,
      roomNum,
      roomName,
      participantsPerRoom,
      error,
      roomDrafts,
    } = this.state;
    // @TODO STUDENTLIST SHOULD REFLECT THIS.STATE.REMAINING STUDENTS -- RIGHT NOW THERE IS A
    // DISCREPANCY BETWEEN THOSE LISTS AS ONE HOLD IDS AND THE OTHER HOLDS OBJECTS
    const participantList = (
      <ParticipantList
        list={selectedParticipants}
        selectedParticipants={selectedParticipants}
        select={this.setParticipants}
      />
    );
    const assignmentMatrix = (
      <AssignmentMatrix
        list={selectedParticipants}
        selectedParticipants={selectedParticipants.filter(
          (mem) => mem.role === 'facilitator'
        )}
        select={this.updateParticipants}
        roomNum={parseInt(roomNum, 10)} // ensure a number is passed
        activity={activity}
        course={course}
        dueDate={dueDate}
        userId={userId}
        rooms={roomDrafts}
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
          assignmentMatrix={assignmentMatrix}
          submit={this.submit}
          setRandom={this.setRandom}
          setManual={this.setManual}
          setNumber={this.setNumber}
          shuffleParticipants={this.shuffleParticipants}
          participantsPerRoom={participantsPerRoom}
          roomNum={parseInt(roomNum, 10)} // ensure a number is passed
          roomName={roomName}
          setRoomNumber={this.setRoomNumber}
          setRoomName={this.setRoomName}
          setParticipantNumber={this.setParticipantNumber}
          isRandom={isRandom}
          error={error}
        />
      );
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
      <BigModal show closeModal={close}>
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
  participants: PropTypes.arrayOf(PropTypes.shape({})),
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
  participants: [],
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
