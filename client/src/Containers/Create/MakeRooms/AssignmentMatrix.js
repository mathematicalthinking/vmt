import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Aux, BigModal } from 'Components';
import NewStep1 from './NewStep1';
import classes from './makeRooms.css';

const AssignmentMatrix = (props) => {
  const {
    list, // should be 'allParticipants'
    requiredParticipants,
    roomDrafts,
    select, // should be 'setRoomDrafts'
    canDeleteRooms, // should be 'canAddDeleteRooms'
    updateList, // won't be needed when AddParticipants refactored out
    courseId, // won't be needed when AddParticipants refactored out
    userId, // won't be needed when AddParticipants refactored out
    sortParticipants, // won't be needed when AddParticipants refactored out
  } = props;

  // won't be needed when AddParticipants refactored out
  const [showModal, setShowModal] = useState(false);

  // =========== HANDLE CHANGES IN NUMBER OF ROOMS ==============

  const deleteRoom = (index) => {
    if (roomDrafts.length <= 1) return;
    const roomList = [...roomDrafts];
    roomList.splice(index, 1);
    select(roomList);
  };

  const addRoom = (index) => {
    const roomList = [...roomDrafts];
    const newRoom = {
      members: [...requiredParticipants],
    };
    roomList.splice(index, 0, newRoom);
    select(roomList);
  };

  // ======================= HANDLE WHEN A PERSON GETS CLICKED (ASSIGNED TO A ROOM) ===========================

  const selectParticipant = (event, data) => {
    const { roomIndex } = data;
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

  // =========================================================

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
          <caption className={classes.Caption}>Rooms</caption>
          <thead>
            <tr className={classes.LockedTop}>
              <th className={classes.LockedColumn}>
                Participants{' '}
                <i
                  className={`fas fa-solid fa-plus ${classes.plus}`}
                  title="Add Participants"
                  onClick={() => setShowModal(true)}
                  onKeyDown={() => setShowModal(true)}
                  tabIndex={-1}
                  role="button"
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
                  <span>Add / Delete</span>
                </td>
                {roomDrafts.map((room, i) => {
                  const index = i; // defeat the linter
                  return (
                    <td
                      key={`room-${index}-delete`}
                      className={classes.CellAction}
                    >
                      <i
                        className={`fas fa-solid fa-plus ${classes.plus}`}
                        id={`room-${i}-addBtn`}
                        disabled={roomDrafts.length >= list.length}
                        data-testid={`addRoom-${i + 1}`}
                        onClick={() => addRoom(i)}
                        onKeyDown={() => addRoom(i)}
                        tabIndex={-1}
                        role="button"
                      />
                      <i
                        className={`fas fa-solid fa-minus ${classes.minus}`}
                        id={`room-${i}-deleteBtn`}
                        disabled={roomDrafts.length <= 1}
                        data-testid={`deleteRoom-${i + 1}`}
                        onClick={() => deleteRoom(i)}
                        onKeyDown={() => deleteRoom(i)}
                        tabIndex={-1}
                        role="button"
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
  courseId: PropTypes.string,
  userId: PropTypes.string.isRequired,
  roomDrafts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  canDeleteRooms: PropTypes.bool,
};

AssignmentMatrix.defaultProps = {
  courseId: '',
  roomNum: 1,
  canDeleteRooms: true,
};

export default AssignmentMatrix;
