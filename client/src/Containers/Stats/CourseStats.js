import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'Components';
import { usePopulatedRoom } from 'utils/utilityHooks';
import statsReducer, { initialState } from './statsReducer';
import { exportCSV } from './stats.utils';

const CourseStats = ({ roomIds }) => {
  // start with rooms
  const populatedRooms = roomIds.map((roomId) =>
    usePopulatedRoom(roomId, true)
  );

  const combinedLog = populatedRooms
    .filter((roomQuery) => roomQuery.isSuccess)
    .reduce(
      (acc, { data: populatedRoom }) => [...acc, ...(populatedRoom.log || [])],
      []
    );

  const [state, dispatch] = useReducer(statsReducer, initialState);
  const { filteredData } = state;

  const augmentedData = filteredData.map(
    // add in user_id, studentId (From user metadata), roomName
    () => {}
  );
  useEffect(() => {
    if (combinedLog && combinedLog.length > 0)
      dispatch({ type: 'GENERATE_DATA', data: combinedLog });
  }, [combinedLog.length]);

  return combinedLog && combinedLog.length > 0 ? (
    <div>
      Click here to download events from all rooms in this course:&nbsp;
      <Button
        theme="None"
        key="2"
        data-testid="download-csv"
        click={() => exportCSV(augmentedData, `$courseData_csv`)}
      >
        <i className="fas fa-download" style={{ color: 'blue' }} />
      </Button>
    </div>
  ) : (
    <div data-testid="no-data-message">
      This room does not have any activity yet.
    </div>
  );
};

CourseStats.propTypes = {
  // populatedRoom: PropTypes.shape({}).isRequired,
  roomIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default CourseStats;
