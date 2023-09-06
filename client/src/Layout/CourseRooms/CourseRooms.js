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
  getGoogleIcons,
  GOOGLE_ICONS,
} from 'utils';
import { addUserRoleToResource } from 'store/utils';
import { archiveRooms, restoreArchivedRoom } from 'store/actions';
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
  const { course, userId } = props;
  const initialFilters = {
    myRole: 'all',
    roomStatus: 'default',
  };
  const courseId = course._id;

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
  }, [course.rooms]);

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
      icon: (
        <ToolTip text="Preview" delay={600}>
          {getGoogleIcons(GOOGLE_ICONS.PREVIEW, [classes.CustomIcon])}
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
          {getGoogleIcons(GOOGLE_ICONS.REPLAYER, [classes.CustomIcon])}
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
        const toDisplay = `${
          currRoom.status === 'default' ? 'Archive' : 'Unarchive'
        }`;
        return (
          <ToolTip text={toDisplay} delay={600}>
            {getGoogleIcons(GOOGLE_ICONS[toDisplay.toUpperCase()], [
              classes.CustomIcon,
            ])}
          </ToolTip>
        );
      },
    },
  ];

  const archiveAllButton = {
    title: 'Archive',
    onClick: (e, selectedIds, handleDeselectAll) => {
      e.preventDefault();
      const selectedIdsToArchive = selectedIds.filter(
        (roomId) => rooms[roomId].status === 'default'
      );
      // do nothing onClick if there's nothing to archive
      if (!selectedIdsToArchive.length) return;
      handleArchive(selectedIdsToArchive, true, handleDeselectAll);
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
          {getGoogleIcons(
            GOOGLE_ICONS.ARCHIVE,
            [classes.CustomIcon, classes.SelectActionsIcon],
            style
          )}
        </ToolTip>
      );
    },
  };

  const unArchiveAllButton = {
    title: 'Unarchive',
    onClick: (e, selectedIds, handleDeselectAll) => {
      e.preventDefault();
      const selectedIdsToUnarchive = selectedIds.filter(
        (roomId) => rooms[roomId].status === 'archived'
      );
      if (!selectedIdsToUnarchive.length) return;
      handleArchive(selectedIdsToUnarchive, false, handleDeselectAll);
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
          {getGoogleIcons(
            GOOGLE_ICONS.UNARCHIVE,
            [classes.CustomIcon, classes.SelectActionsIcon],
            style
          )}
        </ToolTip>
      );
    },
  };

  // Handles both Archive (showArchive=true) & Unarchive (showArchive=false)
  const handleArchive = (id, showArchive, handleDeselectAll) => {
    let msgType = 'Archive';
    let msgModifier = '';
    let msgEnding;
    if (!showArchive) {
      msgType = 'Unarchive';
    }
    let singleResource = true;
    if (Array.isArray(id)) {
      // display each name in list
      singleResource = false;
      // only dipslay first 5 resources names, otherwise total number
      if (id.length <= 5) {
        if (id.length === 1) msgModifier = 'the following room: ';
        else msgModifier = `the following ${id.length} rooms:`;
        msgEnding = getResourceNames(id).join(', ');
      } else {
        msgModifier = 'these ';
        msgEnding = `${id.length} rooms`;
      }
    }
    // or display single name
    else msgEnding = rooms[id].name;

    const dispatchArchive = () =>
      singleResource
        ? dispatch(archiveRooms([id]))
        : dispatch(archiveRooms(id));

    const dispatchRestore = () => {
      if (singleResource) {
        return dispatch(restoreArchivedRoom(id));
      }

      return Promise.all(
        id.map((resId) => dispatch(restoreArchivedRoom(resId)))
      );
    };

    if (showArchive) {
      showArchiveModal(
        <div>
          <span>
            <span style={{ fontWeight: 'bolder' }}>{`${msgType} `}</span>
            {`${msgModifier} `}
            <span style={{ fontWeight: 'bolder', display: 'inline-block' }}>
              {`${msgEnding}`}
            </span>
          </span>
          <div>
            <Button
              data-testid="archive-resource"
              click={() => {
                dispatchArchive().then(() => {
                  fetchCourseRoomsFromDB();
                  if (typeof handleDeselectAll === 'function') {
                    handleDeselectAll();
                  }
                });
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
            <span style={{ fontWeight: 'bolder' }}>{`${msgType} `}</span>
            {`${msgModifier} `}
            <span style={{ fontWeight: 'bolder', display: 'inline-block' }}>
              {`${msgEnding}`}
            </span>
          </span>
          <div>
            <Button
              data-testid="archive-resource"
              click={() => {
                dispatchRestore().then(() => {
                  fetchCourseRoomsFromDB();
                  if (typeof handleDeselectAll === 'function') {
                    handleDeselectAll();
                  }
                });
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
      marginRight: '2rem',
      background: 'rgb(239, 243, 246)',
      border: '1px solid #ddd',
      fontWeight: '600',
      fontSize: '1.1em',
      borderRadius: '3px',
    },
    selectactions: {
      background: 'rgb(239, 243, 246)',
      border: '1px solid #ddd',
    },
    contentbox: {},
  };

  const InfoBoxCustomStyles = {
    section: { marginBottom: '0' },
    header: {},
    left: {},
    icons: {},
    right: {},
    rightTitle: {},
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
      <span className={classes.CreateRoom}>
        <NewResource resource="rooms" courseId={courseId} />
      </span>
      <div className={classes.Filters}>
        <div className={classes.SortUI}>
          <SortUI keys={keys} sortFn={resetSort} sortConfig={sortConfig} />
        </div>
        <span className={classes.InfoBoxContainer}>
          <span className={classes.InfoBoxFilters}>
            <InfoBox
              title="My Role"
              icon={<i className="fas fa-filter" />}
              customStyle={InfoBoxCustomStyles}
            >
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
          </span>

          <span className={classes.InfoBoxFilters}>
            <InfoBox
              title="Room Status"
              icon={<i className="fas fa-filter" />}
              customStyle={InfoBoxCustomStyles}
            >
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
          </span>
        </span>
      </div>

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
  );
};

CourseRooms.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string,
    rooms: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  userId: PropTypes.string.isRequired,
};

export default CourseRooms;
