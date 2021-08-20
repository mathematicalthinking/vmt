import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'Components';
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
    userId,
  } = props;
  const [rooms, setRooms] = useState([]);
  // const [userList, setUserList] = useState([]);
  const date = dueDate ? new Date(dueDate) : new Date();
  const dateStamp = `${date.getMonth() + 1}-${date.getDate()}`;

  const newRoom = {
    activity: activity._id,
    roomIndex: 0,
    name: '',
    members: [],
  };

  useEffect(() => {
    // setRooms([]);
    const facilitators = [];
    list.forEach((user) => {
      if (user.role === 'facilitator') {
        facilitators.push({
          role: user.role,
          _id: user.user._id,
        });
      }
    });
    let roomList = [];
    for (let i = 0; i < roomNum; i++) {
      const currentRoom = { ...newRoom };
      currentRoom.roomIndex = i;
      currentRoom.name = `${activity.name} room ${i + 1} (${dateStamp})`;
      currentRoom.course = course;
      currentRoom.members = [...facilitators];
      roomList = [...roomList, currentRoom];
    }
    setRooms(roomList);
  }, [roomNum]);

  const selectParticipant = (event, data) => {
    const roomId = data.roomIndex;
    const user = {
      role: data.participant.role || 'participant',
      _id: data.participant.user._id,
    };
    if (user._id && roomId >= 0) {
      const roomsUpdate = [...rooms];
      const index = checkUser(roomId, user._id);
      if (index < 0) {
        roomsUpdate[roomId].members.push({ ...user });
      }
      if (index >= 0) {
        roomsUpdate[roomId].members.splice(index, 1);
      }
      setRooms(roomsUpdate);
      select(roomsUpdate);
    }
  };

  const modRoomName = (event) => {
    const roomsUpdate = [...rooms];
    const roomId = event.target.id.split(':')[1];
    roomsUpdate[roomId].name = event.target.value;
    setRooms(roomsUpdate);
  };

  const checkUser = (roomId, user) => {
    return rooms[roomId].members.findIndex((mem) => mem._id === user);
  };

  return (
    <Fragment>
      <table className={classes.Table}>
        {/* top row rooms list */}
        <tr>
          <th>Participants</th>
          {rooms.map((room, i) => {
            return (
              <th
                className={classes.roomsList}
                key={`room-${i + 1}`}
                id={`room-${i}`}
              >
                <TextInput
                  light
                  size={14}
                  value={room.name}
                  name={`roomName:${i}`}
                  change={(event) => {
                    modRoomName(event);
                  }}
                />
              </th>
            );
          })}
        </tr>
        <tbody>
          {list.map((participant, i) => {
            const rowClass = selectedParticipants.includes(participant)
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
                  const data = {
                    roomKey,
                    participant,
                    roomIndex: room.roomIndex,
                  };
                  return (
                    <td key={`${participant.user._id}rm${j + 1}`}>
                      <input
                        type="checkbox"
                        id={roomKey}
                        disabled={userId === participant.user._id}
                        data-testid={`checkbox${i + 1}-${j + 1}`}
                        onChange={(event) => {
                          selectParticipant(event, data);
                        }}
                        checked={
                          checkUser(room.roomIndex, participant.user._id) >= 0
                        }
                      />
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
  selectedParticipants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  select: PropTypes.func.isRequired,
  roomNum: PropTypes.number,
  activity: PropTypes.shape({}),
  course: PropTypes.string,
  dueDate: PropTypes.instanceOf(Date),
  userId: PropTypes.string.isRequired,
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
