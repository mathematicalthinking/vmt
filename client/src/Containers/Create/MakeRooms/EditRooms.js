import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateRoom } from 'store/actions';
import { updateGroupings } from 'store/actions/rooms';
import { AssignmentMatrix, EditRoomAssignments } from './index';

const EditRooms = (props) => {
  const { activity, course, selectedAssignment, userId, close } = props;
  const dispatch = useDispatch();
  const history = useHistory();

  const [roomDrafts, setRoomDrafts] = useState(selectedAssignment.value);
  const [participants, setParticipants] = useState([]);
  const [roomNum, setRoomNum] = useState(selectedAssignment.value.length);
  const [dueDate, setDueDate] = useState(selectedAssignment.dueDate || '');
  const [aliasMode, setAliasMode] = useState(selectedAssignment.aliasMode);
  const [roomName, setRoomName] = useState(selectedAssignment.label);
  const [defaultRoomName, setDefaultRoomName] = useState(
    selectedAssignment.label
  );

  useEffect(() => {
    // derive participants from members within roomDrafts
    const participantsObj = {};
    const newRoomDrafts = selectedAssignment.value;
    newRoomDrafts.forEach((room) => {
      room.members.forEach((mem) => {
        if (!participantsObj[mem.user._id]) participantsObj[mem.user._id] = mem;
      });
    });

    const updatedParticipants = Object.values(participantsObj).map(
      (mem) => mem
    );

    updateParticipants(newRoomDrafts);
    setParticipants(updatedParticipants);

    // sorting facilitators like below reverses the order that rooms are displayed
    // ex: if there's 3 rooms, room 3 members are displayed on top of the table,
    //     room 1 members are displayed at the bottom of the table
    // setParticipants(
    //   [...updatedParticipants].sort((a) => (a.role === 'facilitator' ? 1 : -1))
    // );

    setDueDate(selectedAssignment.dueDate || '');
    setAliasMode(selectedAssignment.aliasMode);
    setRoomName(selectedAssignment.label);
    setDefaultRoomName(selectedAssignment.label);
  }, [selectedAssignment]);

  const updateParticipants = (selectionMatrix) => {
    setRoomDrafts(selectionMatrix);
  };

  const editPreviousAssignment = () => {
    /**
     * If there are new room ids in the updatedAssignment that weren't
     * in the previousAssignment w/the same id as updatedAssignmnet,
     * create those rooms & associate them with the activity, course &
     * grouping in the db/store. Also, replace the previousAssignment
     * with the _id of updatedAssignment in previousAssignments with the
     * updatedAssignment
     * Create a function to updateGroupings => add the new rooms / remove any
     * deleted rooms
     *
     * If the only change is which members are in which room, call
     * dispatch updateRoom for each roomId and pass in the updatedMembers
     *
     * Activity._id & Course._id are found in the roomDrafts object of
     * the updatedAssignment
     */

    selectedAssignment.value.forEach((oldRoomDraft, i) => {
      const membersToUpdate = roomDrafts[i].members.map((mem) => ({
        role: mem.role,
        color: mem.color,
        user: mem.user,
      }));

      const body = {
        members: membersToUpdate,
        settings: { displayAliasedUsernames: aliasMode },
        dueDate: dueDate,
        name: `${roomName}: ${i + 1}`,
      };
      dispatch(updateRoom(oldRoomDraft.room, body));
    });

    // if roomName has changed, update the grouping in the store/db
    if (roomName !== defaultRoomName) {
      dispatch(updateGroupings(course, activity, selectedAssignment._id, roomName))
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
      requiredParticipants={participants.filter(
        // required people
        (mem) => mem.role === 'facilitator'
      )}
      select={updateParticipants}
      roomNum={parseInt(roomNum, 10)} // ensure a number is passed
      activity={activity}
      courseId={course ? course._id : null}
      userId={userId}
      roomDrafts={roomDrafts}
      canDeleteRooms={false}
    />
  );

  return (
    <EditRoomAssignments
      assignmentMatrix={assignmentMatrix}
      selectedAssignment={selectedAssignment}
      aliasMode={aliasMode}
      setAliasMode={setAliasMode}
      dueDate={dueDate}
      setDueDate={setDueDate}
      defaultRoomName={defaultRoomName}
      roomName={roomName}
      setRoomName={setRoomName}
      submit={editPreviousAssignment}
      close={close}
    />
  );
};

export default EditRooms;
