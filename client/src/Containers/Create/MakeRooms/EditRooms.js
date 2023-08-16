import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import isEqual from 'lodash/isEqual';
import { updateRoom } from 'store/actions';
import {
  inviteToRoom,
  removeRoomMember,
  updateGroupings,
} from 'store/actions/rooms';
import { Button } from 'Components';
import { addColors, dateAndTime, useAppModal } from 'utils';
import { AssignmentMatrix, AssignRooms } from '.';
import classes from './makeRooms.css';

const EditRooms = (props) => {
  const {
    activity,
    course,
    participants: courseParticipants,
    selectedAssignment,
    userId,
    close,
    roomSettings,
    roomSettingsComponent,
  } = props;
  const dispatch = useDispatch();
  const history = useHistory();

  const courses = useSelector((state) => state.courses.byId);

  const [roomDrafts, setRoomDrafts] = useState(selectedAssignment.value);
  const [participants, setParticipants] = useState([]);
  const submitArgs = React.useRef(); // used for passing along submit info
  const roomNum = selectedAssignment.value.length;
  const { show: showTheWarning, hide: hideModals } = useAppModal();

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
      (acc, mem) =>
        ['facilitator', 'participant'].includes(mem.role)
          ? {
              ...acc,
              [mem.user._id]: mem,
            }
          : acc,
      {}
    );

    setRoomDrafts(newRoomDrafts);
    setParticipants(addColors(Object.values(assignmentParticipants)));

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
      : showWarning();
  };

  const deleteRemovedRoomMembers = (
    previousRoomMembers,
    roomMembersToUpdate,
    roomId
  ) => {
    const prevUsersIds = previousRoomMembers.map((prevMem) => prevMem.user._id);
    const newUsersIds = roomMembersToUpdate.map((mem) => mem.user._id);
    const membersToRemove = prevUsersIds.filter(
      (prevUserId) => !newUsersIds.includes(prevUserId) && prevUserId
    );

    if (membersToRemove.length > 0) {
      membersToRemove.forEach((memId) =>
        dispatch(removeRoomMember(roomId, memId))
      );
    }
  };

  const inviteNewRoomMembers = (
    previousRoomMembers,
    newRoomMembers,
    roomId
  ) => {
    const prevUsers = previousRoomMembers.map((prevMem) => prevMem.user._id);
    const newUsers = newRoomMembers.map((mem) => mem.user._id);
    const membersToInvite = newUsers.filter(
      (newUser) => !prevUsers.includes(newUser)
    );

    if (membersToInvite.length > 0) {
      const newUsersObj = newRoomMembers.reduce((acc, curr) => {
        return { ...acc, [curr.user._id]: curr };
      }, {});
      membersToInvite.forEach((newMemId) => {
        dispatch(
          inviteToRoom(roomId, newMemId, newUsersObj[newMemId].user.username)
        );
      });
    }
  };

  const editPreviousAssignment = ({ dueDate, roomName, initialRoomName }) => {
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

      const previousMembers = oldRoomDraft.members.map((prevMem) => ({
        role: prevMem.role,
        color: prevMem.color,
        user: prevMem.user,
      }));

      deleteRemovedRoomMembers(
        previousMembers,
        membersToUpdate,
        oldRoomDraft._id
      );

      inviteNewRoomMembers(previousMembers, membersToUpdate, oldRoomDraft._id);

      // make an if statement that use lodash to check if the new settings are the same as the selectedAssignment settings
      if (isEqual(roomSettings, selectedAssignment.settings)) {
        dispatch(
          updateRoom(oldRoomDraft._id, {
            settings: { ...roomSettings },
          })
        );
      }

      if (
        dueDate !== selectedAssignment.dueDate && // if new dueDate
        !(!dueDate && !selectedAssignment.dueDate) // and dueDates have value
      ) {
        dispatch(updateRoom(oldRoomDraft._id, { dueDate }));
      }

      // if roomName has changed,
      // update the room name for each room in selectedAssignment
      if (roomName !== initialRoomName) {
        dispatch(
          updateRoom(oldRoomDraft._id, { name: `${roomName}: ${i + 1}` })
        );
      }
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

  const getCourseName = (courseId) => {
    return (courses[courseId] && courses[courseId].name) || null;
  };

  const headerComponent = (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label htmlFor="room-settings" className={classes.SortText}>
      Room Settings:
      <div className={classes.SortSelection}>{roomSettingsComponent}</div>
    </label>
  );

  const assignmentMatrix = (
    <AssignmentMatrix
      allParticipants={participants}
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
      getCourseName={getCourseName}
      headerComponent={headerComponent}
    />
  );

  const showWarning = () => {
    showTheWarning(
      <Fragment>
        <div>
          There are unassigned participants. Do you want to continue with the
          editing of this assignment?
        </div>
        <div>
          <Button
            m={10}
            click={() => {
              editPreviousAssignment(submitArgs.current);
              hideModals();
            }}
          >
            Assign
          </Button>
          <Button m={10} theme="Cancel" click={hideModals}>
            Cancel
          </Button>
        </div>
      </Fragment>
    );
  };

  return (
    <AssignRooms
      initialDueDate={selectedAssignment.dueDate || ''}
      initialRoomName={
        selectedAssignment.roomName ||
        `${activity.name} (${dateAndTime.toDateString(new Date())})`
      }
      assignmentMatrix={assignmentMatrix}
      onSubmit={checkBeforeSubmit}
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
    creator: PropTypes.string,
  }).isRequired,
  course: PropTypes.shape({ _id: PropTypes.string }),
  selectedAssignment: PropTypes.shape({
    _id: PropTypes.string,
    settings: PropTypes.shape({}),
    dueDate: PropTypes.string,
    roomName: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.shape({})),
    label: PropTypes.string,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  participants: PropTypes.arrayOf(PropTypes.shape({})),
  roomSettings: PropTypes.shape({}).isRequired,
  roomSettingsComponent: PropTypes.node,
};

EditRooms.defaultProps = {
  course: null,
  participants: [],
  roomSettingsComponent: null,
};

export default EditRooms;
