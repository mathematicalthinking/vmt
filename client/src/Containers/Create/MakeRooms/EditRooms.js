import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateRoom } from 'store/actions';
import { updateGroupings } from 'store/actions/rooms';
import { AssignmentMatrix, AssignRooms } from './index';

const EditRooms = (props) => {
  const { activity, course, selectedAssignment, userId, close } = props;
  const dispatch = useDispatch();
  const history = useHistory();

  const [roomDrafts, setRoomDrafts] = useState(selectedAssignment.value);
  const [participants, setParticipants] = useState([]);
  const [roomNum, setRoomNum] = useState(selectedAssignment.value.length);

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
  }, [selectedAssignment]);

  const updateParticipants = (selectionMatrix) => {
    setRoomDrafts(selectionMatrix);
  };

  const editPreviousAssignment = ({
    aliasMode,
    dueDate,
    roomName,
    initialRoomName,
  }) => {
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
        dueDate,
        name: `${roomName}: ${i + 1}`,
      };
      dispatch(updateRoom(oldRoomDraft.room, body));
    });

    // if roomName has changed, update the grouping in the store/db
    if (roomName !== initialRoomName) {
      dispatch(
        updateGroupings(course, activity, selectedAssignment._id, roomName)
      );
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
    <AssignRooms
      initialAliasMode={selectedAssignment.aliasMode || false}
      initialDueDate={selectedAssignment.dueDate || ''}
      initialRoomName={
        selectedAssignment.roomName ||
        `${activity.name} (${new Date().toLocaleDateString()})`
      }
      assignmentMatrix={assignmentMatrix}
      onSubmit={editPreviousAssignment}
      onCancel={close}
    />
  );
};

EditRooms.propTypes = {
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
  selectedAssignment: PropTypes.shape({
    _id: PropTypes.string,
    aliasMode: PropTypes.bool,
    dueDate: PropTypes.string,
    roomName: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.shape({})),
    label: PropTypes.string,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
};

EditRooms.defaultProps = {
  course: {},
};

export default EditRooms;
