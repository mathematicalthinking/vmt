import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Aux, BigModal } from 'Components';
import NewStep1 from './NewStep1';
import classes from './makeRooms.css';

const AssignmentMatrix = (props) => {
  const {
    list,
    updateList,
    requiredParticipants,
    select,
    roomNum,
    setRoomNum,
    activity,
    courseId,
    dueDate,
    userId,
    roomDrafts,
    canDeleteRooms,
    aliasMode,
    roomName,
    sortParticipants,
  } = props;

  const [showModal, setShowModal] = useState(false);

  const date = dueDate ? new Date(dueDate) : new Date();
  const dateStamp = `${date.getMonth() + 1}-${date.getDate()}`;

  const newRoom = {
    activity: activity._id,
    name: '',
    members: [],
  };

  useEffect(() => {
    const facilitators = list.filter((member) => member.role === 'facilitator');
    let roomList = [...roomDrafts];
    if (roomNum > roomDrafts.length) {
      for (let i = roomDrafts.length; i < roomNum; i++) {
        const currentRoom = { ...newRoom };
        currentRoom.name = `${activity.name} room ${i + 1} (${dateStamp})`;
        currentRoom.course = courseId;
        currentRoom.members = [...facilitators];
        roomList = [...roomList, currentRoom];
      }
    } else if (roomNum !== roomDrafts.length) {
      roomList.splice(roomNum - roomDrafts.length);
    }
    select(roomList);
  }, [roomNum]);

  const deleteRoom = (index) => {
    if (roomDrafts.length <= 1) return;
    const roomList = [...roomDrafts];
    roomList.splice(index, 1);
    for (let i = index; i < roomList.length; i++) {
      roomList[i].name = `${roomName}: ${i + 1}`;
    }
    setRoomNum(roomList.length);
    select(roomList);
  };

  const addRoom = (index) => {
    if (roomDrafts.length >= list.length) return;
    const roomList = [...roomDrafts];
    const newRoom = {
      activity: activity._id,
      description: activity.description,
      roomType: activity.roomType,
      desmosLink: activity.desmosLink,
      ggbFile: activity.ggbFile,
      instructions: activity.instructions,
      image: activity.image,
      tabs: activity.tabs,
      creator: userId,
      course: courseId,
      dueDate,
      settings: { displayAliasedUsernames: aliasMode },
      name: `${roomName}: ${index + 1}`,
      members: list.filter((member) => member.role === 'facilitator'),
    };

    for (let i = index; i < roomList.length; i++) {
      roomList[i].name = `${roomName}: ${i + 2}`;
    }
    roomList.splice(index, 0, newRoom);
    setRoomNum(roomList.length);
    select(roomList);
  };

  const selectParticipant = (event, data) => {
    const roomIndex = data.roomIndex;
    const user = {
      role: data.participant.role || 'participant',
      _id: data.participant.user._id,
      user: data.participant.user,
    };
    if (user._id && roomIndex >= 0) {
      const roomsUpdate = [...roomDrafts];
      const index = checkUser(roomIndex, user);
      if (index < 0) {
        roomsUpdate[roomIndex].members.push({ ...user });
      }
      if (index >= 0) {
        roomsUpdate[roomIndex].members.splice(index, 1);
      }
      select(roomsUpdate);
    }
  };

  const checkUser = (roomIndex, user) => {
    return roomDrafts[roomIndex].members.findIndex(
      (mem) => mem.user._id === user._id
    );
  };

  const handleAddParticipants = () => {
    return (
      <BigModal
        show={showModal}
        closeModal={() => {
          setShowModal(false);
        }}
      >
        <Aux>
          <NewStep1
            participants={list}
            updateList={updateList}
            userId={userId}
            // select={this.selectParticipant}
            courseId={courseId}
            close={() => setShowModal(false)}
            sortParticipants={sortParticipants}
            // selectedParticipants={selectedParticipants}
          />
        </Aux>
      </BigModal>
    );
  };

  return (
    <Fragment>
      {showModal && handleAddParticipants()}
      <div className={classes.AssignmentMatrix}>
        <table className={classes.Table}>
          <caption className={classes.Caption}>Number of Rooms</caption>
          <thead>
            <tr className={classes.LockedTop}>
              <th className={classes.LockedColumn}>
                Participants{' '}
                <i
                  className={`fas fa-solid fa-plus ${classes.plus}`}
                  title="Add Participants"
                  onClick={() => setShowModal(true)}
                />
              </th>
              {roomDrafts.map((room, i) => {
                return (
                  <th
                    className={classes.RoomsList}
                    key={`room-${i + 1}`}
                    id={`room-${i}`}
                  >
                    {i + 1}
                    {/* <TextInput
                    type="textarea"
                    light
                    size="14"
                    value={room.name}
                    name={`roomName:${i}`}
                    change={(event) => {
                      modRoomName(event);
                    }}
                  /> */}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* top row rooms list */}
            {list.map((participant, i) => {
              const rowClass = requiredParticipants.some(
                ({ user }) => user.username === participant.user.username
              )
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
                  {roomDrafts.map((room, j) => {
                    const roomKey = `${participant.user._id}rm${j}`;
                    const data = {
                      roomKey,
                      participant,
                      roomIndex: j,
                    };
                    return (
                      <td
                        key={`${participant.user._id}rm${j + 1}`}
                        className={classes.CellAction}
                      >
                        <input
                          type="checkbox"
                          id={roomKey}
                          disabled={userId === participant.user._id}
                          data-testid={`checkbox${i + 1}-${j + 1}`}
                          onChange={(event) => {
                            selectParticipant(event, data);
                          }}
                          checked={checkUser(j, participant.user) >= 0}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {canDeleteRooms && (
              <tr className={`${classes.Participant} ${classes.LockedBottom}`}>
                <td key="room-delete-row" className={classes.LockedColumn}>
                  <span>Add / Delete?</span>
                </td>
                {roomDrafts.map((room, i) => {
                  const index = i; // defeat the linter
                  return (
                    <td
                      key={`room-${room.name}${index}-delete`}
                      className={classes.CellAction}
                    >
                      <i
                        className={`fas fa-solid fa-plus ${classes.plus}`}
                        id={`room-${i}-addBtn`}
                        disabled={roomDrafts.length >= list.length}
                        data-testid={`addRoom-${i + 1}`}
                        onClick={() => addRoom(i)}
                      />
                      <i
                        className={`fas fa-solid fa-minus ${classes.minus}`}
                        id={`room-${i}-deleteBtn`}
                        disabled={roomDrafts.length <= 1}
                        data-testid={`deleteRoom-${i + 1}`}
                        onClick={() => deleteRoom(i)}
                      />
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
};

AssignmentMatrix.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  requiredParticipants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  select: PropTypes.func.isRequired,
  roomNum: PropTypes.number,
  activity: PropTypes.shape({}),
  courseId: PropTypes.string,
  dueDate: PropTypes.instanceOf(Date),
  userId: PropTypes.string.isRequired,
  roomDrafts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  canDeleteRooms: PropTypes.bool,
};

AssignmentMatrix.defaultProps = {
  activity: null,
  courseId: '',
  roomNum: 1,
  dueDate: null,
  canDeleteRooms: true,
};

export default AssignmentMatrix;
