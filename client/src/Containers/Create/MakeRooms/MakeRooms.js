import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'Components';
import { createGrouping, inviteToCourse } from 'store/actions';
import { useAppModal, COLOR_MAP, addColors } from 'utils';
import { AssignmentMatrix, AssignRooms, AddParticipants } from '.';
import classes from './makeRooms.css';

const MakeRooms = (props) => {
  const {
    activity,
    course = null,
    participants: initialParticipants = [],
    selectedAssignment = {},
    userId,
    close,
    roomSettings,
    roomSettingsComponent = null,
  } = props;

  const dispatch = useDispatch(); // Elsewhere we use 'connect()'; this is the modern approach
  const history = useHistory(); // Elsewhere we use 'withRouter()'; this is the modern approach

  const courses = useSelector((state) => state.courses.byId);

  const [participantsPerRoom, setParticipantsPerRoom] = useState(3);
  const [participants, setParticipants] = useState([]);
  const [roomDrafts, setRoomDrafts] = useState([]);
  const submitArgs = useRef(); // used for passing along submit info
  const membersToInviteToCourse = useRef(null);

  const {
    show: showTheWarning,
    hide: hideModals,
    showBig: showAddParticipants,
  } = useAppModal();

  // NOTE: These two useEffects react when props change. That's the correct way of checking and responding to
  // changed props.  However, the correct way of detecting and responding to a changed state is to act when the
  // change-state function is called.

  // if the initial list of participants changes, reset the participant list, the number of rooms, and the PPR display
  useEffect(() => {
    // Standalone Template -> extract participants from selectedAssignment,
    // if it exists
    if (!course && selectedAssignment.value.length) {
      const newRoomDrafts = selectedAssignment.value;
      const members = newRoomDrafts.map((room) => room.members).flat();
      // ensure no repeats
      const newParticipants = members.reduce(
        (acc, mem) => ({
          ...acc,
          [mem.user._id]: mem,
        }),
        {}
      );

      setParticipants(addColors(Object.values(newParticipants)));
      updateParticipants(newRoomDrafts);
    } else {
      const filteredParticipants = initialParticipants;
      setParticipants(sortParticipants(filteredParticipants));
      setRoomNum(
        Math.max(
          Math.floor(filterFacilitators(filteredParticipants).length / 3),
          1
        )
      );
      setParticipantsPerRoom(3);
    }
  }, [initialParticipants]);

  // if the selected assignment changes, reset the display
  useEffect(() => {
    if (selectedAssignment && Array.isArray(selectedAssignment.value)) {
      if (selectedAssignment.value.length !== 0) {
        setRoomDrafts(selectedAssignment.value);
        // sort participants by their room assignments (as best as possible)
        const sortedParticipants = selectedAssignment.value
          .map((room) => room.members)
          .flat()
          .concat(participants) // make sure we at least have expected participants
          .filter((mem) => ['facilitator', 'participant'].includes(mem.role))
          .reduce(
            (acc, mem) => ({
              ...acc,
              [mem.user._id]: mem,
            }),
            {}
          );

        const newParticipants = addColors(Object.values(sortedParticipants));

        setParticipants(newParticipants);

        setParticipantsPerRoom(
          Math.max(
            Math.floor(
              filterFacilitators(newParticipants).length /
                selectedAssignment.value.length
            ),
            1
          )
        );
      } else {
        const newParticipants = addColors(
          initialParticipants.filter((mem) =>
            ['facilitator', 'participant'].includes(mem.role)
          )
        );
        setParticipants(newParticipants);
        setRoomNum(
          Math.max(
            Math.floor(
              newParticipants.filter((p) => p.role === 'participant').length /
                participantsPerRoom
            ),
            1
          ),
          true
        );
      }
    } else {
      setRoomNum(
        Math.max(
          Math.floor(
            initialParticipants.filter((p) => p.role === 'participant').length /
              participantsPerRoom
          ),
          1
        )
      );
    }
  }, [selectedAssignment]);

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
    const updatedParticipants = shuffleMemberList(
      restructureMemberlist(filterFacilitators(participants))
    );

    const numRooms = Math.floor(
      updatedParticipants.length / participantsPerRoom
    );

    const roomsUpdate = resetParticipants([...roomDrafts]);

    const participantsToAssign = [...updatedParticipants];
    for (let i = 0; i < numRooms; i++) {
      if (roomsUpdate[i]) {
        roomsUpdate[i].members = [
          ...roomsUpdate[i].members,
          ...participantsToAssign.splice(0, participantsPerRoom),
        ];
      }
    }

    // assign any extra participants to other rooms
    participantsToAssign.forEach((participant, roomNum) => {
      roomsUpdate[roomNum % roomsUpdate.length].members.push(participant);
    });

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
        // if there isn't a role or _id, provide default values
        role: 'participant',
        _id: mem.user._id,
        ...mem,
      };
      return user;
    });
  };

  const clusterByCourse = (members) => {
    return Object.values(
      members.reduce((acc, member) => {
        if (!acc[member.course]) {
          acc[member.course] = [];
        }
        acc[member.course].push(member);
        return acc;
      }, {})
    );
  };

  const shuffleMemberList = (members) => {
    // Cluster members by the course they are from; randomize the array clusters
    const courseClusters = _.shuffle(clusterByCourse(members));

    // randomize the members within each cluster
    const randomizedClusters = courseClusters.map((cluster) =>
      _.shuffle(cluster)
    );

    // interleave the clusters proportionally
    const minLength = Math.min(
      ...randomizedClusters.map((cluster) => cluster.length)
    );
    const maxLength = Math.max(
      ...randomizedClusters.map((cluster) => cluster.length)
    );

    const peoplePerRoom = randomizedClusters.map((cluster) =>
      Math.floor(cluster.length / minLength)
    );

    const result = [];
    for (let x = 0; x < maxLength; x++) {
      randomizedClusters.forEach((cluster, index) => {
        const itemsToAdd = cluster.slice(
          x * peoplePerRoom[index],
          (x + 1) * peoplePerRoom[index]
        );
        result.push(...itemsToAdd);
      });
    }

    return result;
  };

  const filterFacilitators = (membersArray) => {
    return membersArray.filter((mem) => mem.role !== 'facilitator');
  };

  const updateParticipants = (selectionMatrix) => {
    setRoomDrafts(selectionMatrix);
    setParticipantsPerRoom(
      Math.max(
        Math.floor(
          filterFacilitators(participants).length / selectionMatrix.length
        ),
        1
      )
    );
  };

  const handleMembersToInvite = (memsToInvite) => {
    membersToInviteToCourse.current = memsToInvite;
  };

  const setPPR = (ppr, newParticipants) => {
    const numberOfParticipants = newParticipants
      ? filterFacilitators(newParticipants).length
      : filterFacilitators(participants).length;
    // Make sure that number of participants per room is between 1 and the number of participants
    const adjustedPPR = Math.max(Math.min(ppr, numberOfParticipants), 1);
    setParticipantsPerRoom(adjustedPPR);
    const numRooms = Math.max(
      Math.floor(numberOfParticipants / adjustedPPR),
      1
    );
    setRoomNum(numRooms);
  };

  const handleAddParticipantsSubmit = (
    newParticipants,
    shouldInviteMembersToCourse,
    participantsToInvite
  ) => {
    const newParticipantsWithColors = addColors(newParticipants);
    setParticipants(newParticipantsWithColors);
    setPPR(
      calculatePPR(filterFacilitators(newParticipantsWithColors)),
      newParticipantsWithColors
    );
    if (shouldInviteMembersToCourse)
      handleMembersToInvite(participantsToInvite);
  };

  const calculatePPR = (members) => {
    const clusters = clusterByCourse(members);
    const numberOfMembers = members.length;

    // if more than 6 classes collaborating, set PPR to 6
    if (clusters.length > 6) return 6;

    // set the possiblePPR to be at least the number of collaborating classes
    const possiblePPRs = [3, 4, 5, 6].filter((ppr) => ppr >= clusters.length);

    // return a number that minimizes the number of 'extra' students
    const ans = possiblePPRs.reduce((a, b) =>
      numberOfMembers % a <= numberOfMembers % b ? a : b
    );

    return ans;
  };

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
    return everyoneAssigned ? submit(submitInfo) : showWarning();
  };

  const submit = ({ dueDate, roomName }) => {
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
      settings: { ...roomSettings },
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
        course: mem.course,
      }));

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
      dispatch(
        createGrouping(roomsToCreate, activity, course, roomName, {
          ...roomSettings,
        })
      );
      // if user was added via AddParticipants (showModal),
      // invite them to the course
      if (membersToInviteToCourse.current) {
        membersToInviteToCourse.current.forEach((memToInvite) => {
          inviteToCourse(
            course._id,
            memToInvite.user._id,
            memToInvite.user.username,
            memToInvite
          )(dispatch);
        });
      }
    } else {
      dispatch(
        createGrouping(roomsToCreate, activity, null, roomName, {
          ...roomSettings,
        })
      );
    }
    close();
    const { pathname: url } = history.location;
    // delete the word 'assign' and replace it with 'rooms'
    const indexOfLastSlash = url.lastIndexOf('/');
    history.push(`${url.slice(0, indexOfLastSlash + 1)}rooms`);
  };

  const handleAddParticipants = () => {
    // We want to make sure that React always mounts a new AddParticipants instance because
    // that component contains lots of state. To do this
    // we set a unique key for the component when the user clicks on the add participants button.
    // Note: This is NOT the anti-pattern of setting key to be a constantly changing value (Date.now()),
    // which can lead to large numbers of renders. The key is just unique with each press of the add
    // participants button. There shouldn't be any more renders than usual.
    //
    // An alternative way to handle this situation would be to put a "clean up" function inside of AddParticipants that
    // clears out all the state.
    const key = Date.now();
    showAddParticipants(
      <AddParticipants
        key={key}
        participants={participants}
        userId={userId}
        onSubmit={handleAddParticipantsSubmit}
        onCancel={hideModals}
        courseCheckbox={course !== null}
        originatingCourseId={course && course._id}
      />
    );
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
      requiredParticipants={initialParticipants.filter(
        (mem) => mem.role === 'facilitator'
      )}
      select={updateParticipants}
      userId={userId}
      roomDrafts={roomDrafts}
      canDeleteRooms
      onAddParticipants={handleAddParticipants}
      getCourseName={getCourseName}
      headerComponent={headerComponent}
    />
  );

  const showWarning = () => {
    showTheWarning(
      <Fragment>
        <div>
          There are unassigned participants. Do you want to continue with this
          assignment?
        </div>
        <div>
          <Button
            m={10}
            click={() => {
              submit(submitArgs.current);
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
      initialRoomName={`${activity.name}`}
      participantsPerRoom={participantsPerRoom}
      setParticipantsPerRoom={setPPR}
      assignmentMatrix={assignmentMatrix}
      onSubmit={checkBeforeSubmit}
      onShuffle={shuffleParticipants}
      onCancel={close}
    />
  );
};

MakeRooms.propTypes = {
  selectedAssignment: PropTypes.shape({
    dueDate: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.shape({})),
    roomName: PropTypes.string,
    settings: PropTypes.shape({}),
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
    creator: PropTypes.string,
  }).isRequired,
  course: PropTypes.shape({ _id: PropTypes.string }),
  userId: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  participants: PropTypes.arrayOf(PropTypes.shape({})),
  roomSettings: PropTypes.shape({}).isRequired,
  roomSettingsComponent: PropTypes.node,
};

export default MakeRooms;
