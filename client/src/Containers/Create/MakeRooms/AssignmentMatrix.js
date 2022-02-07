import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'Components';
import classes from './makeRooms.css';

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
    rooms,
  } = props;
  const date = dueDate ? new Date(dueDate) : new Date();
  const dateStamp = `${date.getMonth() + 1}-${date.getDate()}`;

  const newRoom = {
    activity: activity._id,
    name: '',
    members: [],
  };

  useEffect(() => {
    const facilitators = [];
    list.forEach((user) => {
      if (user.role === 'facilitator') {
        facilitators.push({
          role: user.role,
          _id: user.user._id,
        });
      }
    });
    let roomList = [...rooms];
    if (roomNum > rooms.length) {
      for (let i = rooms.length; i < roomNum; i++) {
        const currentRoom = { ...newRoom };
        currentRoom.name = `${activity.name} room ${i + 1} (${dateStamp})`;
        currentRoom.course = course;
        currentRoom.members = [...facilitators];
        roomList = [...roomList, currentRoom];
      }
    } else {
      roomList.splice(roomNum - rooms.length);
    }
    select(roomList);
  }, [roomNum]);

  const deleteRoom = (index) => {
    const roomList = [...rooms];
    roomList.splice(index, 1);
    select(roomList);
  };

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
      select(roomsUpdate);
    }
  };

  const modRoomName = (event) => {
    const roomsUpdate = [...rooms];
    const roomId = event.target.id.split(':')[1];
    roomsUpdate[roomId].name = event.target.value;
    select(roomsUpdate);
  };

  const checkUser = (roomId, user) => {
    return rooms[roomId].members.findIndex((mem) => mem._id === user);
  };

  return (
    <Fragment>
      <table className={classes.Table}>
        <tbody>
          {/* top row rooms list */}
          <tr>
            <th className={classes.LockedColumn}>Participants</th>
            {rooms.map((room, i) => {
              return (
                <th
                  className={classes.RoomsList}
                  key={`room-${i + 1}`}
                  id={`room-${i}`}
                >
                  <TextInput
                    type="textarea"
                    light
                    size="14"
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
                <td className={classes.LockedColumn}>
                  {`${i + 1}. ${participant.user.username}`}
                </td>
                {rooms.map((room, j) => {
                  const roomKey = `${participant.user._id}rm${j}`;
                  const data = {
                    roomKey,
                    participant,
                    roomIndex: j,
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
                        checked={checkUser(j, participant.user._id) >= 0}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr className={classes.Participant}>
            <td key="room-delete-row">
              <span>Delete Room?</span>
            </td>
            {rooms.map((room, i) => {
              const index = i; // defeat the linter
              return (
                <td key={`room-${room.name}${index}-delete`}>
                  <button
                    type="button"
                    id={`room-${i}-deleteBtn`}
                    disabled={rooms.length <= 1}
                    data-testid={`deleteRoom-${i + 1}`}
                    onClick={() => deleteRoom(i)}
                  >
                    Delete
                  </button>
                </td>
              );
            })}
          </tr>
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
  rooms: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

AssignmentMatrix.defaultProps = {
  activity: null,
  course: '',
  roomNum: 1,
  dueDate: null,
};

export default AssignmentMatrix;
