import React, { useReducer, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button, InfoBox, RadioBtn, ToolTip, SortUI } from 'Components';
import { SelectableBoxList } from 'Layout';
import {
  timeFrames,
  useAppModal,
  useSortableData,
  useUIState,
  API,
} from 'utils';
import { RoomPreview } from 'Containers';
import { updateRoom, archiveRooms } from 'store/actions';
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
  const { courseId } = props;
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
    rooms,
    sortConfig: initialConfig,
    filters: initialFilters,
  });
  const [rooms, setRooms] = useState(uiState.rooms || []);

  const [filters, filtersDispatch] = useReducer(
    filtersReducer,
    uiState.filters || initialFilters
  );

  const history = useHistory();
  const dispatch = useDispatch();

  const { showBig: showPreviewModal } = useAppModal();
  const { hide: hideArchiveModal, show: showArchiveModal } = useAppModal();

  const { items: sortedRooms, resetSort, sortConfig } = useSortableData(
    rooms,
    uiState.sortConfig || initialConfig
  );

  const { items: displayRooms, resetSort: resetFilter } = useSortableData(
    sortedRooms
  );

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
    API.getAllCourseRooms(courseId)
      .then((res) => {
        console.log('res');
        console.log(res);
        const courseRooms = res.data.results;
        setRooms(courseRooms);
      })
      .catch((err) => console.log(err));
    return () => {
      setUIState({ rooms, sortConfig, filters });
    };
  }, []);

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
            open_in_new
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
            replay
          </span>
        </ToolTip>
      ),
    },
    {
      title: 'Archive',
      onClick: (e, id) => {
        e.preventDefault();
        handleArchive(id);
      },
      icon: (
        <ToolTip text="Archive" delay={600}>
          <span className={`material-symbols-outlined ${classes.CustomIcon}`}>
            input
          </span>
        </ToolTip>
      ),
    },
  ];

  const archiveAllButton = {
    title: 'Archive',
    onClick: (e, id) => {
      e.preventDefault();
      if (!id.length) return;
      handleArchive(id);
    },
    icon: (
      <ToolTip text="Archive" delay={600}>
        <span
          className={`material-symbols-outlined ${classes.CustomIcon}`}
          data-testid="Archive"
          style={{ fontSize: '23px' }}
        >
          input
        </span>
      </ToolTip>
    ),
  };

  // create a handle multiple fn that calls this fn
  // get rid of singleResource
  const handleArchive = (id) => {
    let res;
    let msg = 'Are you sure you want to archive ';
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
    else res = rooms.filter((el) => el._id === id)[0].name;

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
  };

  const selectActions = [archiveAllButton];

  const getResourceNames = (ids) => {
    return rooms.filter((res) => ids.includes(res._id)).map((res) => res.name);
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
        />
      </div>
    </div>
  );
};

CourseRooms.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseRooms;
