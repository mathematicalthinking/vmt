import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateRoom } from 'store/actions';
import { updateGroupings } from 'store/actions/rooms';
import { Button, Modal } from 'Components';
import AssignmentMatrix from './AssignmentMatrix';
import AssignRooms from './AssignRooms';

const EditRooms = (props) => {
  const {
    activity,
    course,
    participants: courseParticipants,
    selectedAssignment,
    userId,
    close,
  } = props;
  const dispatch = useDispatch();
  const history = useHistory();

  const [roomDrafts, setRoomDrafts] = useState(selectedAssignment.value);
  const [participants, setParticipants] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const submitArgs = React.useRef(); // used for passing along submit info
  const roomNum = selectedAssignment.value.length;

  useEffect(() => {
    // derive participants from members within the selected assignment
    const newRoomDrafts = selectedAssignment.value;
    const assignmentMembers = newRoomDrafts.map((room) => room.members).flat();
    // if we are in a course, consider the course members as well
    const fullMembers = assignmentMembers.concat(
      course ? courseParticipants : []
    );
    // ensure no repeats
    const assignmentParticipants = fullMembers.reduce(
      (acc, mem) => ({
        ...acc,
        [mem.user._id]: mem,
      }),
      {}
    );

    setRoomDrafts(newRoomDrafts);
    setParticipants(Object.values(assignmentParticipants));

    // sorting facilitators like below reverses the order that rooms are displayed
    // ex: if there's 3 rooms, room 3 members are displayed on top of the table,
    //     room 1 members are displayed at the bottom of the table
    // setParticipants(
    //   [...updatedParticipants].sort((a) => (a.role === 'facilitator' ? 1 : -1))
    // );
  }, [selectedAssignment]);

  const checkBeforeSubmit = (submitInfo) => {
    submitArgs.current = submitInfo;
    const everyoneAssigned = participants.every(
      (participant) =>
        participant.user &&
        roomDrafts.some((room) =>
          room.members.some(
            (mem) => mem.user && mem.user._id === participant.user._id
          )
        )
    );
    return everyoneAssigned
      ? editPreviousAssignment(submitInfo)
      : setShowWarning(true);
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
      select={setRoomDrafts}
      roomNum={parseInt(roomNum, 10)} // ensure a number is passed
      activity={activity}
      courseId={course ? course._id : null}
      userId={userId}
      roomDrafts={roomDrafts}
      canDeleteRooms={false}
    />
  );

  return (
    <Fragment>
      {showWarning && (
        <Modal show={showWarning} closeModal={() => setShowWarning(false)}>
          <div>
            There are unassigned participants. Do you want to continue with the
            editing of this assignment?
          </div>
          <div>
            <Button
              m={10}
              click={() => editPreviousAssignment(submitArgs.current)}
            >
              Assign
            </Button>
            <Button m={10} theme="Cancel" click={() => setShowWarning(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}
      <AssignRooms
        initialAliasMode={selectedAssignment.aliasMode || false}
        initialDueDate={selectedAssignment.dueDate || ''}
        initialRoomName={
          selectedAssignment.roomName ||
          `${activity.name} (${new Date().toLocaleDateString()})`
        }
        assignmentMatrix={assignmentMatrix}
        onSubmit={checkBeforeSubmit}
        onCancel={close}
      />
    </Fragment>
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
  participants: PropTypes.arrayOf(PropTypes.shape({})),
};

EditRooms.defaultProps = {
  course: null,
  participants: [],
};

export default EditRooms;
