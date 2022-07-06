import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { updateRoom } from 'store/actions';
import { AssignmentMatrix, EditRoomAssignments } from './index';

const EditRooms = (props) => {
  const { activity, course, selectedAssignment, userId, close } = props;
  const dispatch = useDispatch();
  const history = useHistory();

  const [roomDrafts, setRoomDrafts] = useState(selectedAssignment.value);
  const [participants, setParticipants] = useState([]);
  const [roomNum, setRoomNum] = useState(selectedAssignment.value.length);
  const [dueDate, setDueDate] = useState('');
  const [aliasMode, setAliasMode] = useState(false);
  const [roomName, setRoomName] = useState(selectedAssignment.label);

  useEffect(() => {
    // derive participants from members within roomDrafts
    const participantsObj = {};
    roomDrafts.forEach((room) => {
      room.members.forEach((mem) => {
        if (!participantsObj[mem.user._id]) participantsObj[mem.user._id] = mem;
      });
    });

    const updatedParticipants = Object.values(participantsObj).map(
      (mem) => mem
    );

    setParticipants(updatedParticipants);
  }, []);

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
      roomName={roomName}
      setRoomName={setRoomName}
      submit={editPreviousAssignment}
      close={close}
    />
  );
};

export default EditRooms;
