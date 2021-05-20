import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classes from './makeRooms.css';
// import { Checkbox } from '../../../Components';

const AssignmentMatrix = (props) => {
  const {
    list,
    selectedParticipants,
    select,
    roomNum,
    activity,
    course,
    dueDate,
  } = props;
  const [rooms, setRooms] = useState([]);
  const date = dueDate ? new Date(dueDate) : new Date();
  const dateStamp = `${date.getMonth()}-${date.getDate()}`;

  const newRoom = {
    activity: activity._id,
    roomIndex: 0,
    name: '',
    members: [],
  };

  // let defaultMembers = {};
  // useEffect(() => {
  //   //  default member list
  //   list.forEach((member) => {
  //     defaultMembers = { ...defaultMembers, [member.user._id]: false };
  //   });
  // }, [list]);

  useEffect(() => {
    // setRooms([]);
    let roomList = [];
    for (let i = 0; i < roomNum; i++) {
      const currentRoom = { ...newRoom };
      currentRoom.roomIndex = i;
      currentRoom.name = `${activity.name} room ${i + 1} (${dateStamp})`;
      currentRoom.course = course;
      currentRoom.members = [];
      roomList = [...roomList, currentRoom];
    }
    setRooms(roomList);
  }, [roomNum]);
  // logging this to avoid unused prop
  console.log('Select function: ', select);

  const selectParticipant = (event, dataId) => {
    console.log('rooms:', rooms);
    const userId = dataId.split('rm')[0];
    const roomId = dataId.split('rm')[1];
    console.log('Selected: ', userId, ' in room ', roomId);
    if (userId && roomId >= 0) {
      const roomsUpdate = [...rooms];
      const index = roomsUpdate[roomId].members.indexOf(userId);
      // console.log('Rooms before: ', roomsUpdate, ' index: ', index);
      if (index < 0) {
        roomsUpdate[roomId].members.push(userId);
      }
      if (index >= 0) {
        roomsUpdate[roomId].members.splice(index, 1);
      }
      setRooms(roomsUpdate);
      console.log('All rooms: ', roomsUpdate);
    }
    // let updatedSelectedParticipants = [...selectedParticipants];
    // // if user is already selected, remove them from the selected lis
    // if (selectedParticipants.includes(newParticipant)) {
    //   updatedSelectedParticipants = selectedParticipants.filter(
    //     (participant) => participant !== newParticipant
    //   );
    //   // updatedRemainingParticipants.push()
    //   // if the user is not already selected, add them to selected and remove from remaining
    // } else {
    //   updatedSelectedParticipants.push(newParticipant);
    // }
    // this.setState({
    //   selectedParticipants: updatedSelectedParticipants,
    // });
    // Else add them
  };

  // const checkSelection = (userId, roomId) => {
  //   if (rooms[roomId]) {
  //     console.log(
  //       'Checking ',
  //       rooms[roomId],
  //       ' for ',
  //       userId,
  //       ':',
  //       rooms[roomId].members.includes(userId)
  //     );
  //     return rooms[roomId].members.includes(userId);
  //   }
  //   return false;
  //  };

  return (
    <Fragment>
      <table className={classes.Table}>
        {/* top row rooms list */}
        <thead>
          <tr>
            <th>Participants</th>
            {rooms.map((room, i) => {
              return (
                <th
                  // className={roomsList}
                  key={`room-${i + 1}`}
                  id={`room-${i + 1}`}
                >
                  {room.name}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {list.map((participant, i) => {
            const rowClass = selectedParticipants.includes(participant.user._id)
              ? [classes.Participant, classes.Selected].join(' ')
              : classes.Participant;
            return (
              <tr
                className={rowClass}
                key={participant.user._id}
                id={participant.user._id}
              >
                <td>{`${i + 1}. ${participant.user.username}`}</td>
                {rooms.map((room, j) => {
                  const roomKey = `${participant.user._id}rm${room.roomIndex}`;
                  return (
                    <td key={`${participant.user._id}rm${j + 1}`}>
                      <input
                        type="checkbox"
                        id={roomKey}
                        userid={roomKey}
                        onChange={(event) => {
                          selectParticipant(event, roomKey);
                        }}
                        checked={rooms[j].members.includes(
                          participant.user._id
                        )}
                      />
                      {/* <Checkbox
                        change={selectParticipant}
                        dataId={roomKey}
                        id={roomKey}
                        checked={checkSelection(
                          participant.user._id,
                          room.roomIndex
                        )}
                      >
                        {' '}
                      </Checkbox> */}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Fragment>
  );
};

AssignmentMatrix.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  selectedParticipants: PropTypes.arrayOf(PropTypes.string).isRequired,
  select: PropTypes.func.isRequired,
  roomNum: PropTypes.number,
  activity: PropTypes.shape({}),
  course: PropTypes.string,
  dueDate: PropTypes.instanceOf(Date),
};

AssignmentMatrix.defaultProps = {
  // error: null,
  // isRandom: false,
  // participantsPerRoom: 0,
  activity: null,
  course: '',
  roomNum: 1,
  dueDate: null,
};

export default AssignmentMatrix;
