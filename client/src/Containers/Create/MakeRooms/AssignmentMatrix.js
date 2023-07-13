import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { Checkbox } from 'Components';
import { useSortableData } from 'utils';
import classes from './makeRooms.css';

const AssignmentMatrix = (props) => {
  const { allParticipants, roomDrafts, ...otherProps } = props;

  const defaultOption = { label: 'Sort...', value: [] };
  const keys = [
    { label: 'Name a-z', value: { key: 'username', direction: 'ascending' } },
    // { label: 'Name z-a', value: { key: 'username', direction: 'descending' } },
    { label: 'By course', value: { key: 'course', direction: 'ascending' } },
    { label: 'By room', value: 'rooms' },
  ];

  const [participantsToDisplay, setParticipantsToDisplay] = useState(
    allParticipants
  );
  const [selection, setSelection] = useState(defaultOption);

  // put username at top level

  const { items: sortedParticipants, resetSort } = useSortableData(
    allParticipants.map((mem) => ({
      course: null,
      ...mem,
      username: mem.user.username,
    }))
  );

  React.useEffect(() => {
    setParticipantsToDisplay(allParticipants);
  }, [allParticipants]);

  React.useEffect(() => {
    if (selection.value !== 'rooms')
      setParticipantsToDisplay(sortedParticipants);
  }, [selection]);

  React.useEffect(() => {
    // if (selection.value === 'rooms') handleSort(selection);
    setSelection(defaultOption);
  }, [roomDrafts]);

  const handleSort = (selectedOption) => {
    setSelection(selectedOption);
    if (selectedOption.value === 'rooms') {
      // sort by rooms
      const mems = roomDrafts.map((room) => room.members).flat();
      const uniqueParticipants = Object.values(
        mems.concat(allParticipants).reduce((acc, curr) => {
          return { ...acc, [curr.user._id]: curr };
        }, {})
      );
      setParticipantsToDisplay(uniqueParticipants);
    } else {
      resetSort(selectedOption.value);
    }
  };

  // set up what we are going to sort on
  return (
    <div className={classes.AssignmentMatrixContainer}>
      <div className={classes.SortContainer}>
        <label htmlFor="sort" className={classes.SortText}>
          Sort:
          <div className={classes.SortSelection}>
            <Select
              options={keys.map((key) => ({
                label: key.label,
                value: key.value,
              }))}
              onChange={handleSort}
              isSearchable={false}
              defaultValue={defaultOption}
              inputId="sort"
            />
          </div>
        </label>
      </div>
      <TheMatrix
        allParticipants={participantsToDisplay}
        roomDrafts={roomDrafts}
        {...otherProps}
      />
    </div>
  );
};

AssignmentMatrix.propTypes = {
  allParticipants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  roomDrafts: PropTypes.arrayOf(
    PropTypes.shape({ members: PropTypes.arrayOf(PropTypes.shape({})) })
  ).isRequired,
};

const TheMatrix = (props) => {
  const {
    allParticipants,
    requiredParticipants,
    roomDrafts,
    select, // should be 'setRoomDrafts'
    canDeleteRooms, // should be 'canAddDeleteRooms'
    userId,
    onAddParticipants,
    getCourseName,
  } = props;

  // absentParticipants is an arry of user ids
  const [absentParticipants, setAbsentParticipants] = useState([]);

  // =========== SORT FACILITATORS TO THE END OF ALL PARTICIPANTS ==============
  const sortAllParticipants = () => {
    const facilitators = allParticipants
      .filter((mem) => mem.role === 'facilitator')
      .sort((a, b) => (a.user.username < b.user.username ? -1 : 1));

    const participants = allParticipants.filter(
      (mem) => mem.role !== 'facilitator'
    );

    const sorted = [...participants].concat([...facilitators]);
    return sorted;
  };

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

  // ======================= HANDLE WHEN A PERSON GETS CLICKED (ASSIGNED TO OR UNASSIGNED FROM A ROOM) ===========================

  const selectParticipant = (event, data) => {
    const { roomIndex } = data;
    const member = {
      // if there isn't a role or _id, provide default values
      role: 'participant',
      user: { _id: data.participant.user._id },
      ...data.participant,
    };
    // create a deep copy of roomDrafts to avoid reference sharing
    const roomsUpdate = JSON.parse(JSON.stringify(roomDrafts));
    const index = checkUser(roomIndex, member.user);
    if (index < 0) {
      roomsUpdate[roomIndex].members.push({ ...member });
    } else {
      roomsUpdate[roomIndex].members.splice(index, 1);
    }

    select(roomsUpdate);
  };

  const checkUser = (roomIndex, user) => {
    if (absentParticipants.includes(user._id)) return -1;
    return roomDrafts[roomIndex].members.findIndex(
      (mem) => mem.user._id === user._id
    );
  };

  const handleShowCourseOnHover = (courseId) => {
    if (!courseId) return null;
    return getCourseName(courseId);
  };

  // =========================================================

  return (
    <Fragment>
      <div className={classes.Caption}>Rooms</div>
      <div className={classes.AssignmentMatrix}>
        <table className={classes.Table}>
          <thead>
            <tr className={classes.LockedTop}>
              <th className={classes.LockedColumn}>
                <span className={classes.AbsentHeader}>Absent</span>
                Participants{' '}
                {onAddParticipants && (
                  <div
                    className={classes.AliasInstructions}
                    style={{ display: 'inline' }}
                  >
                    <i
                      className={`fas fa-solid fa-plus ${classes.plus}`}
                      onClick={() => {
                        onAddParticipants(true);
                      }}
                      onKeyDown={() => {
                        onAddParticipants(true);
                      }}
                      tabIndex={-1}
                      role="button"
                    >
                      <div className={classes.AliasTooltipContent}>
                        Add participants either individually or by adding an
                        entire course list
                      </div>
                    </i>
                  </div>
                )}
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
            {sortAllParticipants().map((participant, i) => {
              const isSelected = roomDrafts.some((room) =>
                room.members.find(
                  (mem) => mem.user._id === participant.user._id
                )
              );
              const isRequired = requiredParticipants.some(
                ({ user }) => user.username === participant.user.username
              );
              const rowClass = [
                classes.Participant,
                isRequired ? classes.Selected : '',
                isSelected ? classes.SelectionMade : '',
              ].join(' ');

              return (
                <tr
                  className={rowClass}
                  key={participant.user._id}
                  id={participant.user._id}
                >
                  {participant.course ? (
                    <td
                      className={`${classes.LockedColumn} ${classes.tooltip}`}
                      style={{
                        color: `${participant.displayColor || 'black'}`,
                      }}
                    >
                      <React.Fragment>
                        {`${i + 1}. ${participant.user.username}`}
                        <span className={classes.tooltiptext}>
                          {handleShowCourseOnHover(participant.course)}
                        </span>
                      </React.Fragment>
                    </td>
                  ) : (
                    <td
                      className={classes.LockedColumn}
                      style={{
                        color: `${participant.displayColor || 'black'}`,
                      }}
                    >
                      {/* Absence Checkbox */}
                      <Checkbox
                        change={(event, dataId) => {
                          if (absentParticipants.includes(dataId))
                            setAbsentParticipants((prev) =>
                              [...prev].filter((id) => id !== dataId)
                            );
                          else
                            setAbsentParticipants((prev) => [...prev, dataId]);
                        }}
                        checked={absentParticipants.includes(
                          participant.user._id
                        )}
                        id={`absent-checkbox-${participant.user._id}`}
                        dataId={participant.user._id}
                        style={{
                          display: 'inline-block',
                          marginRight: '5px',
                          position: 'relative',
                          top: '-4px',
                        }}
                      >
                        {`${i + 1}. ${participant.user.username}`}
                      </Checkbox>
                    </td>
                  )}
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
                          disabled={
                            userId === participant.user._id ||
                            absentParticipants.includes(participant.user._id)
                          }
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
                        disabled={roomDrafts.length >= allParticipants.length}
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

TheMatrix.propTypes = {
  allParticipants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  requiredParticipants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  select: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  roomDrafts: PropTypes.arrayOf(
    PropTypes.shape({ members: PropTypes.arrayOf(PropTypes.shape({})) })
  ).isRequired,
  canDeleteRooms: PropTypes.bool,
  onAddParticipants: PropTypes.func,
  getCourseName: PropTypes.func,
};

TheMatrix.defaultProps = {
  canDeleteRooms: true,
  onAddParticipants: null,
  getCourseName: null,
};

export default AssignmentMatrix;
