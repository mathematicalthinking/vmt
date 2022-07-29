import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { BigModal } from 'Components';
import { createGrouping } from 'store/actions';
import COLOR_MAP from 'utils/colorMap';
import AssignmentMatrix from './AssignmentMatrix';
import AssignRooms from './AssignRooms';
import AddParticipants from './AddParticipants';

const MakeRooms = (props) => {
  const {
    activity,
    course,
    participants: initialParticipants,
    selectedAssignment,
    userId,
    close,
  } = props;

  const dispatch = useDispatch(); // Elsewhere we use 'connect()'; this is the modern approach
  const history = useHistory(); // Elsewhere we use 'withRouter()'; this is the modern approach

  const [participantsPerRoom, setParticipantsPerRoom] = useState(3);
  const [participants, setParticipants] = useState(initialParticipants);
  const [roomDrafts, setRoomDrafts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // NOTE: These two useEffects react when props change. That's the correct way of checking and responding to
  // changed props.  However, the correct way of detecting and responding to a changed state is to act when the
  // change-state function is called.

  // if the initial list of participants changes, reset the participant list, the number of rooms, and the PPR display
  useEffect(() => {
    setParticipants(sortParticipants(initialParticipants));
    setRoomNum(
      Math.max(Math.ceil(filterFacilitators(initialParticipants).length / 3), 1)
    );
    setParticipantsPerRoom(3);
  }, [initialParticipants]);

  // if the selected assignment changes, reset the display
  useEffect(() => {
    if (selectedAssignment && Array.isArray(selectedAssignment.value)) {
      setRoomDrafts(selectedAssignment.value);
      if (selectedAssignment.value.length !== 0) {
        setParticipantsPerRoom(
          Math.max(
            Math.ceil(
              filterFacilitators(participants).length /
                selectedAssignment.value.length
            ),
            1
          )
        );
      } else
        setRoomNum(
          Math.max(Math.ceil(filterFacilitators(participants).length / 3), 1),
          true
        );
    } else {
      setRoomNum(
        Math.max(Math.ceil(filterFacilitators(participants).length / 3), 1)
      );
    }
  }, [selectedAssignment, participants.length]);

  const setRoomNum = (roomNum, clearRooms) => {
    const newRoomDrafts = clearRooms ? [] : roomDrafts;
    if (roomNum === newRoomDrafts.length) return;
    const requiredMembers = initialParticipants.filter(
      (mem) => mem.role === 'facilitator'
    );
    // Note that Array(n) creates an n length array, but with no values, so cannot map over them. Use fill() to fill the array with
    // undefined so the map will work. Alternatively, could do Array.from(Array(n)).
    const roomList =
      roomNum > newRoomDrafts.length
        ? newRoomDrafts
            .concat(Array(roomNum - newRoomDrafts.length))
            .fill()
            .map(() => ({
              members: [...requiredMembers],
            }))
        : newRoomDrafts.slice(0, roomNum - newRoomDrafts.length);
    setRoomDrafts(roomList);
  };

  const shuffleParticipants = () => {
    const updatedParticipants = shuffleUserList(
      restructureMemberlist(filterFacilitators(participants))
    );

    const numRooms = Math.ceil(
      updatedParticipants.length / participantsPerRoom
    );

    const roomsUpdate = resetParticipants([...roomDrafts]);

    const partcipantsToAssign = [...updatedParticipants];
    for (let i = 0; i < numRooms; i++) {
      if (roomsUpdate[i]) {
        roomsUpdate[i].members = [
          ...roomsUpdate[i].members,
          ...partcipantsToAssign.splice(0, participantsPerRoom),
        ];
      }
    }

    setRoomDrafts(roomsUpdate);
  };

  const resetParticipants = (roomsArray) => {
    return roomsArray.map((roomArray) => {
      const newMems = roomArray.members.filter(
        (mem) => mem.role === 'facilitator'
      );
      return { ...roomArray, members: newMems };
    });
  };

  const sortParticipants = (list) => {
    const facilitators = list
      .filter((mem) => mem.role === 'facilitator')
      .sort((a, b) => a.user.username.localeCompare(b.user.username));
    const prevParticipants = list.filter((mem) => mem.role === 'participant');

    return prevParticipants
      .sort((a, b) => a.user.username.localeCompare(b.user.username))
      .concat(facilitators);
  };

  const restructureMemberlist = (list) => {
    return list.map((mem) => {
      const user = {
        role: mem.role || 'participant',
        _id: mem.user._id,
        user: mem.user,
      };
      return user;
    });
  };

  const shuffleUserList = (array) => {
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

  const filterFacilitators = (membersArray) => {
    return membersArray.filter((mem) => mem.role !== 'facilitator');
  };

  const updateParticipants = (selectionMatrix) => {
    setRoomDrafts(selectionMatrix);
    setParticipantsPerRoom(
      Math.max(
        Math.ceil(
          filterFacilitators(participants).length / selectionMatrix.length
        ),
        1
      )
    );
  };

  const setNumber = (numberOfParticipants) => {
    // Make sure that number of participants is between 1 and the number of participants
    const newNumberOfParticipants = Math.max(
      Math.min(numberOfParticipants, filterFacilitators(participants).length),
      1
    );
    setParticipantsPerRoom(newNumberOfParticipants);
    const numRooms = Math.max(
      Math.ceil(
        filterFacilitators(participants).length / newNumberOfParticipants
      ),
      1
    );
    setRoomNum(numRooms);
  };

  const submit = ({ aliasMode, dueDate, roomName }) => {
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
      settings: { displayAliasedUsernames: aliasMode },
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

      // if (!course) {
      //   members.unshift({
      //     user: userId,
      //     role: 'facilitator',
      //     color: COLOR_MAP[0],
      //   });
      // }

      currentRoom.members = members;
      currentRoom.name = `${roomName}: ${i + 1}`;
      roomsToCreate.push(currentRoom);
    }
    if (roomDrafts.length === 0) {
      // create a room with just the facilitator
      const currentRoom = { ...newRoom };
      currentRoom.members = [{ user: userId, role: 'facilitator' }];
      currentRoom.name = roomName;
      roomsToCreate.push(currentRoom);
    }
    if (course) {
      dispatch(createGrouping(roomsToCreate, activity, course));
    } else {
      dispatch(createGrouping(roomsToCreate, activity));
    }
    close();
    const { pathname: url } = history.location;
    // delete the word 'assign' and replace it with 'rooms'
    const indexOfLastSlash = url.lastIndexOf('/');
    history.push(`${url.slice(0, indexOfLastSlash + 1)}rooms`);
  };

  const assignmentMatrix = (
    <AssignmentMatrix
      list={participants}
      requiredParticipants={initialParticipants.filter(
        (mem) => mem.role === 'facilitator'
      )}
      select={updateParticipants}
      userId={userId}
      roomDrafts={roomDrafts}
      canDeleteRooms
      onAddParticipants={setShowModal}
    />
  );

  return (
    <React.Fragment>
      {showModal && (
        <BigModal
          show={showModal}
          closeModal={() => {
            setShowModal(false);
          }}
        >
          <AddParticipants
            participants={participants}
            updateList={setParticipants}
            userId={userId}
            courseId={course ? course._id : null}
            close={() => {
              setShowModal(false);
            }}
            sortParticipants={sortParticipants}
          />
        </BigModal>
      )}
      <AssignRooms
        initialAliasMode={selectedAssignment.aliasMode || false}
        initialDueDate={selectedAssignment.dueDate || ''}
        initialRoomName={
          selectedAssignment.roomName ||
          `${activity.name} (${new Date().toLocaleDateString()})`
        }
        participantsPerRoom={participantsPerRoom}
        setParticipantsPerRoom={setNumber}
        assignmentMatrix={assignmentMatrix}
        onSubmit={submit}
        onShuffle={shuffleParticipants}
        onCancel={close}
      />
    </React.Fragment>
  );
};

MakeRooms.propTypes = {
  selectedAssignment: PropTypes.shape({
    aliasMode: PropTypes.bool,
    dueDate: PropTypes.string,
    roomName: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  activity: PropTypes.shape({
    name: PropTypes.string,
    _id: PropTypes.string,
    description: PropTypes.string,
    roomType: PropTypes.string,
    desmosLink: PropTypes.string,
    ggbFile: PropTypes.string,
    image: PropTypes.string,
    instructions: PropTypes.string,
    tabs: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  course: PropTypes.shape({ _id: PropTypes.string }),
  userId: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  participants: PropTypes.arrayOf(PropTypes.shape({})),
};

MakeRooms.defaultProps = {
  selectedAssignment: {},
  course: null,
  participants: [],
};

export default MakeRooms;
