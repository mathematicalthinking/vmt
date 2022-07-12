import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createGrouping } from 'store/actions';
import { AssignmentMatrix, AssignRooms } from './index';
import COLOR_MAP from '../../../utils/colorMap';

const NewMakeRooms = (props) => {
  const {
    activity,
    course = null,
    match,
    rooms,
    participants = [],
    selectedAssignment = null,
    userId,
    close,
  } = props;

  const dispatch = useDispatch();
  const history = useHistory();

  const [dueDate, setDueDate] = useState('');
  const [aliasMode, setAliasMode] = useState(false);
  const [error, setError] = useState(null);
  const [roomName, setRoomName] = useState(
    `${activity.name} (${new Date().toLocaleDateString()})`
  );
  const [roomNum, _setRoomNum] = useState(Math.ceil(participants.length / 3));
  const [participantsPerRoom, _setParticipantsPerRoom] = useState(3);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [roomDrafts, setRoomDrafts] = useState([]);
  const [revertRoomNums, setReverRoomNums] = useState(false);

  useEffect(() => {
    setSelectedParticipants(sortParticipants(participants));
    if (selectedAssignment) {
      setAliasMode(selectedAssignment.aliasMode || false);
      setDueDate(selectedAssignment.dueDate || '');
    }
  }, []);

  useEffect(() => {
    if (
      selectedAssignment &&
      Array.isArray(selectedAssignment.value) &&
      selectedAssignment.value.length
    ) {
      setRoomNum(selectedAssignment.value.length);
      setAliasMode(selectedAssignment.aliasMode);
      setDueDate(selectedAssignment.dueDate || '');
    } else {
      const numRooms = Math.ceil(
        filterFacilitators(selectedParticipants).length / participantsPerRoom
      );
      setRoomNum(numRooms);
    }
  }, [selectedAssignment]);

  useEffect(() => {
    const divisor = participantsPerRoom ? participantsPerRoom : 3;
    const numRooms = Math.ceil(
      filterFacilitators(selectedParticipants).length / divisor
    );
    setRoomNum(numRooms);
  }, [selectedParticipants]);

  /**
   * FUNTIONS NEEDED:
   * submit
   * shuffleParticipants ✅
   * select / setParticipants ✅
   * setDueDate / setAlias mode ✅
   * setNumberOfParticipantsPerRoom ✅
   * setNumberOfRooms -> add/delete rooms?
   * setRoomName ✅
   *
   * addMember / selectParticipant -> ??? ->
   * what will this look like ???
   */

  const setParticipantsPerRoom = (num) => {
    if (num === 0 || isNaN(num)) _setParticipantsPerRoom(1);
    else _setParticipantsPerRoom(num);
  };

  const setRoomNum = (num) => {
    if (num === 0 || isNaN(num)) {
      _setRoomNum(1);
    } else {
      _setRoomNum(num);
    }
  };

  const resetRoomDrafts = (revertParticipantsPerRoom = false) => {
    // reset to default numbers of participantsPerRoom & roomNum
    if (revertParticipantsPerRoom) {
      setReverRoomNums(true);
      // setNumber(facilitators.length);
    }

    const newRoom = {
      activity: activity._id,
      course: course ? course._id : null,
      name: '',
      members: [],
    };
    const facilitators = participants.filter(
      (member) => member.role === 'facilitator'
    );
    const date = dueDate ? new Date(dueDate) : new Date();
    const dateStamp = `${date.getMonth() + 1}-${date.getDate()}`;
    let roomList = [];

    for (let i = 0; i < facilitators.length; i++) {
      const currentRoom = { ...newRoom };
      currentRoom.name = `${activity.name} room ${i + 1} (${dateStamp})`;
      currentRoom.members = [...facilitators];
      roomList = [...roomList, currentRoom];
    }

    updateParticipants(roomList);
  };

  const shuffleParticipants = () => {
    const updatedParticipants = shuffleUserList(
      restructureMemberlist(filterFacilitators(selectedParticipants))
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
    setRoomNum(selectionMatrix.length);
  };

  const setNumber = (numberOfParticipants) => {
    if (numberOfParticipants < 1) {
      setParticipantsPerRoom(1);
    } else if (numberOfParticipants > selectedParticipants.length) {
      setParticipantsPerRoom(selectedParticipants.length);
      const numRooms = Math.ceil(
        filterFacilitators(selectedParticipants).length / numberOfParticipants
      );
      setRoomNum(numRooms);
    } else {
      setReverRoomNums(true);
      setParticipantsPerRoom(numberOfParticipants);
    }
  };

  const submit = () => {
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
      if (!course) {
        members.unshift({
          user: userId,
          role: 'facilitator',
          color: COLOR_MAP[0],
        });
      }
      currentRoom.members = members;
      currentRoom.name = `${roomName}: ${i + 1}`;
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
    dispatch(createGrouping(roomsToCreate, activity, course));
    close();
    const { pathname: url } = history.location;
    // delete the word 'assign' and replace it with 'rooms'
    const indexOfLastSlash = url.lastIndexOf('/');
    history.push(`${url.slice(0, indexOfLastSlash + 1)}rooms`);
  };

  const assignmentMatrix = (
    <AssignmentMatrix
      list={selectedParticipants}
      updateList={setSelectedParticipants}
      requiredParticipants={participants.filter(
        (mem) => mem.role === 'facilitator'
      )}
      select={updateParticipants}
      roomNum={parseInt(roomNum, 10)} // ensure a number is passed
      activity={activity}
      courseId={course ? course._id : null}
      userId={userId}
      roomDrafts={roomDrafts}
      canDeleteRooms
      aliasMode={aliasMode}
      roomName={roomName}
      sortParticipants={sortParticipants}
    />
  );

  return (
    <AssignRooms
      activity={activity}
      aliasMode={aliasMode}
      assignmentMatrix={assignmentMatrix}
      dueDate={dueDate}
      resetRoomDrafts={resetRoomDrafts}
      roomName={roomName}
      participantsPerRoom={participantsPerRoom}
      submit={submit}
      setNumber={setNumber}
      setParticipantsPerRoom={setParticipantsPerRoom}
      setRoomNum={setRoomNum}
      shuffleParticipants={shuffleParticipants}
      select={updateParticipants}
      selectedAssignment={selectedAssignment}
      setAliasMode={setAliasMode}
      setDueDate={setDueDate}
      setRoomName={setRoomName}
      close={close}
    />
  );
};

export default NewMakeRooms;
