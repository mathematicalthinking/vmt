import React, { useReducer, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import _pick from 'lodash/pick';
import _map from 'lodash/map';
import _keyBy from 'lodash/keyBy';
import { Button, InfoBox, RadioBtn, ToolTip, SortUI } from 'Components';
import { SelectableBoxList } from 'Layout';
import { RoomPreview } from 'Containers';
import {
  timeFrames,
  useAppModal,
  useSortableData,
  useUIState,
  API,
} from 'utils';
import { addUserRoleToResource } from 'store/utils';
import { updateRoom, archiveRooms, restoreArchivedRoom } from 'store/actions';
import { STATUS } from 'constants.js';
import NewResource from 'Containers/Create/NewResource/NewResource';

import classes from './courseRooms.css';

const filtersReducer = (state, action) => {
  switch (action.type) {
    case 'toggle-myRole':
      return { ...state, myRole: action.filterSelection };
    case 'toggle-roomStatus':
      return { ...state, roomStatus: action.filterSelection };
    default:
      return state;
  }
};

const CourseRooms = (props) => {
  const { courseId, userId } = props;
  const initialFilters = {
    myRole: 'all',
    roomStatus: 'default',
  };

  const keys = [
    { property: 'updatedAt', name: 'Last Updated' },
    { property: 'name', name: 'Name' },
    { property: 'createdAt', name: 'Created Date' },
    { property: 'dueDate', name: 'Due Date' },
  ];

  const initialConfig = {
    key: 'updatedAt',
    direction: 'descending',
    filter: { timeframe: timeFrames.LASTWEEK, key: 'updatedAt' },
  };

  const [uiState, setUIState] = useUIState(`courseRooms-${courseId}`, {
    rooms: {},
    sortConfig: initialConfig,
    filters: initialFilters,
  });
  const [rooms, setRooms] = useState(uiState.rooms || {});

  const [filters, filtersDispatch] = useReducer(
    filtersReducer,
    uiState.filters || initialFilters
  );

  const history = useHistory();
  const dispatch = useDispatch();

  const { showBig: showPreviewModal } = useAppModal();
  const { hide: hideArchiveModal, show: showArchiveModal } = useAppModal();
  const { hide: hideUnarchiveModal, show: showUnarchiveModal } = useAppModal();

  const { items: sortedRooms, resetSort, sortConfig } = useSortableData(
    Object.values(rooms),
    uiState.sortConfig || initialConfig
  );

  const { items: displayRooms, resetSort: resetFilter } = useSortableData(
    sortedRooms
  );

  useEffect(() => {
    fetchCourseRoomsFromDB();
  }, []);

  useEffect(() => {
    resetFilter({
      filter: {
        filterFcn: (item) =>
          (filters.myRole === 'all' || filters.myRole === item.myRole) &&
          (filters.roomStatus === 'all' || filters.roomStatus === item.status),
      },
    });
  }, [filters]);

  useEffect(() => {
    setUIState({ rooms, sortConfig, filters });
  }, [rooms, sortConfig, filters]);

  const fetchCourseRoomsFromDB = () => {
    API.getAllCourseRooms(courseId)
      .then((res) => {
        const courseRooms = res.data.result;
        const modifiedCourseRooms = courseRooms.map((room) => {
          if (room.status === 'archived')
            room.customStyle = { backgroundColor: 'rgba(223, 229, 192, 0.3)' };
          room.myRole = addUserRoleToResource(room, userId).myRole;
          return room;
        });
        setRooms(_keyBy(modifiedCourseRooms, '_id'));
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.log(err));
  };

  const goToReplayer = (roomId) => {
    history.push(`/myVMT/workspace/${roomId}/replayer`);
  };

  const goToRoomPreview = (roomId) => {
    showPreviewModal(<RoomPreview roomId={roomId} />);
  };

  const customIcons = [
    {
      title: 'Preview',
      onClick: (e, id) => {
        e.preventDefault();
        goToRoomPreview(id);
      },
      // icon: <i className="fas fa-external-link-alt" />,
      icon: (
        <ToolTip text="Preview" delay={600}>
          <span className={`material-symbols-outlined ${classes.CustomIcon}`}>
            preview
            {/* gallery_thumbnail */}
          </span>
        </ToolTip>
      ),
    },
    {
      title: 'Replayer',
      onClick: (e, id) => {
        e.preventDefault();
        goToReplayer(id);
      },
      icon: (
        <ToolTip text="Replayer" delay={600}>
          <span className={`material-symbols-outlined ${classes.CustomIcon}`}>
            autoplay
          </span>
        </ToolTip>
      ),
    },
    {
      title: 'Archive/Unarchive',
      onClick: (e, id, handleDeselectAll) => {
        e.preventDefault();
        const currRoom = rooms[id];

        if (currRoom.status === 'default')
          handleArchive(id, true, handleDeselectAll);
        else if (currRoom.status === 'archived')
          handleArchive(id, false, handleDeselectAll);
      },
      generateIcon: (id) => {
        const currRoom = rooms[id];

        const toDisplay = {
          text: `${currRoom.status === 'default' ? 'Archive' : 'Unarchive'}`,
          icon:
            currRoom.status === 'default' ? (
              <span
                className={`material-symbols-outlined ${classes.CustomIcon}`}
              >
                archive
              </span>
            ) : (
              <span
                className={`material-symbols-outlined ${classes.CustomIcon}`}
              >
                unarchive
              </span>
            ),
        };

        return (
          <ToolTip text={toDisplay.text} delay={600}>
            <span>{toDisplay.icon}</span>
          </ToolTip>
        );
      },
    },
  ];

  const archiveAllButton = {
    title: 'Archive',
    onClick: (e, id, handleDeselectAll) => {
      e.preventDefault();
      if (!id.length) return;
      handleArchive(id, true, handleDeselectAll);
    },
    generateIcon: (selectedIds) => {
      // embolden the archive icon style
      // for default status rooms within seletedIds

      const selectedIdsHasRoomsToArchive = selectedIds.some(
        (id) => rooms[id] && rooms[id].status === 'default'
      );
      const fontWeight = selectedIdsHasRoomsToArchive ? 'normal' : '200';
      const cursor = selectedIdsHasRoomsToArchive ? 'pointer' : 'default';
      const style = { fontWeight, cursor };

      return (
        <ToolTip text="Archive" delay={600}>
          <span
            className={`material-symbols-outlined ${classes.CustomIcon} ${classes.SelectActionsIcon}`}
            data-testid="Archive"
            style={style}
          >
            archive
          </span>
        </ToolTip>
      );
    },
  };

  const unArchiveAllButton = {
    title: 'Unarchive',
    onClick: (e, id, handleDeselectAll) => {
      e.preventDefault();
      if (!id.length) return;
      handleArchive(id, false, handleDeselectAll);
    },
    generateIcon: (selectedIds) => {
      // embolden the unarchive icon style
      // for archived rooms within seletedIds

      const selectedIdsHasRoomsToUnarchive = selectedIds.some(
        (id) => rooms[id] && rooms[id].status === 'archived'
      );
      const fontWeight = selectedIdsHasRoomsToUnarchive ? 'normal' : '200';
      const cursor = selectedIdsHasRoomsToUnarchive ? 'pointer' : 'default';
      const style = { fontWeight, cursor };
      return (
        <ToolTip text="Unarchive" delay={600}>
          <span
            className={`material-symbols-outlined ${classes.CustomIcon} ${classes.SelectActionsIcon}`}
            data-testid="Archive"
            style={style}
          >
            unarchive
          </span>
        </ToolTip>
      );
    },
  };

  // Handles both Archive & Unarchive
  const handleArchive = (id, showArchive, handleDeselectAll) => {
    let res;
    let msg = 'Are you sure you want to archive ';
    if (!showArchive) msg = 'Are you sure you want to unarchive ';
    let singleResource = true;
    if (Array.isArray(id)) {
      // display each name in list
      singleResource = false;
      // only dipslay first 5 resources names, otherwise total number
      if (id.length <= 5) {
        res = getResourceNames(id).join(', ');
      } else {
        res = `${id.length} rooms`;
        msg += ' these ';
      }
    }
    // or display single name
    else res = rooms[id].name;

    const dispatchArchive = () => {
      if (singleResource) {
        const rtnObj = {
          status: STATUS.ARCHIVED,
        };
        dispatch(updateRoom(id, rtnObj));
      } else {
        dispatch(archiveRooms(id));
      }
    };

    const dispatchRestore = () => {
      if (singleResource) {
        dispatch(restoreArchivedRoom(id));
      } else {
        id.forEach((resId) => dispatch(restoreArchivedRoom(resId)));
      }
    };

    if (showArchive) {
      showArchiveModal(
        <div>
          <span>
            {msg}
            <span style={{ fontWeight: 'bolder' }}>{res}</span>?
          </span>
          <div>
            <Button
              data-testid="archive-resource"
              click={() => {
                dispatchArchive();
                setTimeout(() => {
                  fetchCourseRoomsFromDB();
                  if (typeof handleDeselectAll === 'function') {
                    handleDeselectAll();
                  }
                }, 1500);
                hideArchiveModal();
              }}
              m={5}
            >
              Yes
            </Button>
            <Button
              data-testid="cancel-manage-user"
              click={hideArchiveModal}
              theme="Cancel"
              m={5}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    } else {
      showUnarchiveModal(
        <div>
          <span>
            {msg}
            <span style={{ fontWeight: 'bolder' }}>{res}</span>?
          </span>
          <div>
            <Button
              data-testid="archive-resource"
              click={() => {
                dispatchRestore();
                setTimeout(() => {
                  fetchCourseRoomsFromDB();
                  if (typeof handleDeselectAll === 'function') {
                    handleDeselectAll();
                  }
                }, 1500);
                hideUnarchiveModal();
              }}
              m={5}
            >
              Yes
            </Button>
            <Button
              data-testid="cancel-manage-user"
              click={hideUnarchiveModal}
              theme="Cancel"
              m={5}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }
  };

  const selectActions = [archiveAllButton, unArchiveAllButton];

  const SelectableBoxListCustomStyles = {
    container: {},
    header: {
      maxWidth: '575px',
      height: '35px',
    },
    checkbox: {
      padding: '10px',
      background: 'rgb(239, 243, 246)',
      border: '1px solid #ddd',
      fontWeight: '600',
      fontSize: '1.1em',
      borderRadius: '3px',
    },
    selectactions: {
      left: '200px',
      position: 'relative',
      background: 'rgb(239, 243, 246)',
      border: '1px solid #ddd',
    },
    contentbox: '',
    Archive: {
      fontWeight: 'light',
    },
    Unrchive: '',
  };

  const getResourceNames = (ids) => {
    return _map(_pick(rooms, ids), 'name');
  };

  const toggleFilter = (filter) => {
    const filterType = filter.split('-')[0]; // ex: myRole
    const filterSelection = filter.split('-')[1]; // ex: facilitator
    filtersDispatch({ type: `toggle-${filterType}`, filterSelection });
  };

  return (
    <div className={classes.CourseRoomsContainer}>
      <div className={classes.CreateRoom}>
        <NewResource resource="rooms" courseId={courseId} />
      </div>
      <div className={classes.Filters}>
        <InfoBox title="My Role" icon={<i className="fas fa-filter" />}>
          <div className={classes.FilterOpts}>
            <RadioBtn
              data-testid="myRole-all-filter"
              check={() => toggleFilter('myRole-all')}
              checked={filters.myRole === 'all'}
              name="myRole-all"
            >
              All
            </RadioBtn>
            <RadioBtn
              data-testid="myRole-facilitator-filter"
              check={() => toggleFilter('myRole-facilitator')}
              checked={filters.myRole === 'facilitator'}
              name="myRole-facilitator"
            >
              Facilitator
            </RadioBtn>
            <RadioBtn
              data-testid="myRole-participant-filter"
              check={() => toggleFilter('myRole-participant')}
              checked={filters.myRole === 'participant'}
              name="myRole-participant"
            >
              Participant
            </RadioBtn>
          </div>
        </InfoBox>
        <InfoBox title="Room Status" icon={<i className="fas fa-filter" />}>
          <div className={classes.FilterOpts}>
            <RadioBtn
              data-testid="roomStatus-all-filter"
              check={() => toggleFilter('roomStatus-all')}
              checked={filters.roomStatus === 'all'}
              name="roomStatus-all"
            >
              All
            </RadioBtn>
            <RadioBtn
              data-testid="roomStatus-default-filter"
              check={() => toggleFilter('roomStatus-default')}
              checked={filters.roomStatus === 'default'}
              name="roomStatus-default"
            >
              Active
            </RadioBtn>
            <RadioBtn
              data-testid="roomStatus-archived-filter"
              check={() => toggleFilter('roomStatus-archived')}
              checked={filters.roomStatus === 'archived'}
              name="roomStatus-archived"
            >
              Archived
            </RadioBtn>
          </div>
        </InfoBox>
      </div>

      <div className={classes.SortUI}>
        <SortUI keys={keys} sortFn={resetSort} sortConfig={sortConfig} />
      </div>

      <div className={classes.RoomsListContainer}>
        <SelectableBoxList
          list={displayRooms}
          resource="rooms"
          listType="private"
          icons={customIcons}
          selectActions={selectActions}
          linkPath="/myVMT/rooms/"
          linkSuffix="/details"
          customStyle={SelectableBoxListCustomStyles}
        />
      </div>
    </div>
  );
};

CourseRooms.propTypes = {
  courseId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
};

export default CourseRooms;
