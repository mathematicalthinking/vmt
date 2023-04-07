import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import { InfoBox, RadioBtn } from 'Components';
import { SortUI } from 'Layout/Dashboard';
import { SelectableBoxList } from 'Layout';
import classes from './courseRooms.css';

const filtersReducer = (state, action) => {
  switch (action.type) {
    case 'toggle-myRole':
      return { ...state, myRole: action.filterSelection };
    case 'toggle-roomStatus':
      return { ...state, roomStatus: action.filterSelection };
    default:
      return;
  }
};

const initialFilterSelections = {
  myRole: 'all',
  roomStatus: 'active',
};

const CourseRooms = (props) => {
  const [filters, filtersDispatch] = useReducer(
    filtersReducer,
    initialFilterSelections
  );

  const toggleFilter = (filter) => {
    const filterType = filter.split('-')[0]; // ex: myRole
    const filterSelection = filter.split('-')[1]; // ex: facilitator
    filtersDispatch({ type: `toggle-${filterType}`, filterSelection });
  };

  return (
    <div>
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
              data-testid="roomStatus-active-filter"
              check={() => toggleFilter('roomStatus-active')}
              checked={filters.roomStatus === 'active'}
              name="roomStatus-active"
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
    </div>
  );
};

CourseRooms.propTypes = {};

export default CourseRooms;
