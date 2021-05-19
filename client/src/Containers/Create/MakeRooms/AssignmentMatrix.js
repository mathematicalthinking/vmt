import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classes from './makeRooms.css';
import { Checkbox } from '../../../Components';

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

  useEffect(() => {
    setRooms([]);
    let roomList = [];
    for (let i = 0; i < roomNum; i++) {
      const currentRoom = { ...newRoom };
      currentRoom.roomIndex = i;
      currentRoom.name = `${activity.name} room ${i + 1} (${dateStamp})`;
      currentRoom.course = course;
      roomList = [...roomList, currentRoom];
    }
    setRooms(roomList);
  }, [roomNum]);

  return (
    <Fragment>
      <table>
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
                  return (
                    <td key={`${participant.user._id}rm${j + 1}`}>
                      <Checkbox
                        label={`${j + 1}. `}
                        change={select}
                        dataId={`${participant.user._id}rm${j + 1}`}
                        key={`${participant.user._id}rm${j + 1}`}
                        checked={
                          selectedParticipants.indexOf(participant.user._id) >
                          -1
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
