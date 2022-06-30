import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Aux, BigModal } from 'Components';
import { createRoom, updateCourse, updateActivity } from 'store/actions';
import { Step1, Step2Course, ParticipantList, AssignmentMatrix } from './index';
import createClasses from '../create.css';
import COLOR_MAP from '../../../utils/colorMap';
import { createGrouping } from 'store/actions/rooms';
import { createPreviousAssignments } from '../../../utils/groupings';

class MakeRooms extends Component {
  constructor(props) {
    super(props);
    const { participants, activity } = this.props;
    this.state = {
      isRandom: true,
      participantsPerRoom: 3,
      roomNum: 1,
      roomName: `${activity.name} (${new Date().toLocaleDateString()})`,
      selectedParticipants: [...participants].sort((a) =>
        a.role === 'facilitator' ? 1 : -1
      ),
      roomDrafts: [],
      dueDate: null,
      error: null,
      step: 0,
      // previousAssignment is a list of Activity-Room-Member objects
      // this is used in Step2Course & AssignmentMatrix
      // to reuse previously assigned activities
      previousAssignments: createPreviousAssignments(
        props.course.groupings,
        props.rooms
      ),
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
      this.setState({ roomNum: number });
    } else {
      this.setState({
        roomNum: 1,
      });
    }
  };

  setRoomName = (newRoomName) => {
    if (newRoomName.length > 0) {
      this.setState({ roomName: newRoomName, error: null });
    } else {
      this.setState({
        roomName: '',
        error: 'Please provide a room name',
      });
    }
  };

  setNumber = (numberOfParticipants) => {
    const { selectedParticipants: participants, isRandom } = this.state;
    const participantsPerRoom = numberOfParticipants;

    if (participantsPerRoom < 1) {
      this.setState({
        participantsPerRoom: 1,
      });
    } else if (participantsPerRoom > participants.length) {
      this.setState({
        participantsPerRoom: participants.length,
      });
    } else {
      this.setState(
        {
          participantsPerRoom,
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
    const { activity } = this.props;
    const date = event && event !== '' ? new Date(event) : new Date();
    const dateStamp = date.toLocaleDateString();
    this.setState({
      dueDate: event,
      roomName: `${activity.name} (${dateStamp})`,
    });
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
    return membersArray.filter((mem) => mem.role !== 'facilitator');
  };

  restructureMemberlist = (list) => {
    return list.map((mem) => {
      const user = {
        role: mem.role || 'participant',
        _id: mem.user._id,
        user: mem.user,
      };
      return user;
    });
  };

  shuffleParticipants = () => {
    const {
      selectedParticipants: participants,
      participantsPerRoom,
      roomDrafts,
    } = this.state;

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
  };

  // NOW THAT WE HAVE A CREATEROOMFROMACTIVITY ACTION THINK ABOUT REFACTORING ALL OF THIS
  // TO UTILIZE THAT FUNCTIONALITY
  submit = () => {
    const {
      activity,
      userId,
      course,
      connectCreateGrouping,
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
      course: course ? course._id : null,
      description,
      roomType,
      desmosLink,
      ggbFile,
      instructions,
      dueDate,
      image,
      tabs,
    };

    const roomsToCreate = [];

    for (let i = 0; i < roomDrafts.length; i++) {
      // const currentRoom = { ...roomDrafts[i] };
      const currentRoom = { ...newRoom };
      const members = roomDrafts[i].members.map((mem, index) => ({
        user: course ? mem.user._id : mem.user,
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
      currentRoom.name = `${roomName}: ${i + 1}`;
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
      currentRoom.name = `${roomName}`;
      roomsToCreate.push(currentRoom);
    }
    connectCreateGrouping(roomsToCreate, activity, course);
    close();
    const { url } = match;
    // delete the word 'assign' and replace it with 'rooms'
    const indexOfLastSlash = url.lastIndexOf('/')
    history.push(`${url.slice(0, indexOfLastSlash + 1)}rooms`);
  };

  render() {
    const {
      activity,
      course,
      userId,
      close,
      rooms,
    } = this.props;
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
      previousAssignments,
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
        requiredParticipants={selectedParticipants.filter(
          // required people
          (mem) => mem.role === 'facilitator'
        )}
        select={this.updateParticipants}
        roomNum={parseInt(roomNum, 10)} // ensure a number is passed
        activity={activity}
        courseId={course ? course._id : null}
        dueDate={dueDate}
        userId={userId}
        roomDrafts={roomDrafts}
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
        courseId={course ? course._id : null}
        selectedParticipants={selectedParticipants}
      />
    );

    if (step === 1) {
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
          rooms={rooms}
          previousAssignments={previousAssignments}
          select={this.updateParticipants}
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
  course: PropTypes.shape({}),
  close: PropTypes.func.isRequired,
  history: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
  connectCreateRoom: PropTypes.func.isRequired,
  rooms: PropTypes.shape({}).isRequired,
};

MakeRooms.defaultProps = {
  course: null,
  participants: [],
};
// const mapDispatchToProps = (dispatch) => ({
//   connectCreateRoom: (room) => dispatch(createRoom(room)),
// });

export default withRouter(
  connect(null, {
    connectCreateRoom: createRoom,
    connectUpdateCourse: updateCourse,
    connectUpdateActivity: updateActivity,
    connectCreateGrouping: createGrouping,
  })(MakeRooms)
);
