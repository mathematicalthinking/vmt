import React, { useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'Components';
import { usePopulatedRoom } from 'utils/utilityHooks';
import { API } from 'utils';
import statsReducer, { initialState } from './statsReducer';
import { exportCSV } from './stats.utils';

const CourseStats = ({ roomIds, name }) => {
  const [loading, setLoading] = useState(true);

  const populatedRooms = roomIds.map((roomId) =>
    usePopulatedRoom(roomId, true)
  );
  const populatedRoomsObject = populatedRooms.reduce((acc, curr) => {
    return curr.data && curr.data._id && { ...acc, [curr.data]: curr.data };
  }, {});

  console.log(populatedRooms)
  console.log(populatedRoomsObject)

  const combinedLog = populatedRooms
    .filter((roomQuery) => roomQuery.isSuccess)
    .reduce(
      (acc, { data: populatedRoom }) => [...acc, ...(populatedRoom.log || [])],
      []
    );

  const [state, dispatch] = useReducer(statsReducer, initialState);
  const augmentedData = React.useRef([]);
  const { filteredData } = state;

  const augmentFilteredData = (data) => {
    const userIds = Array.from(
      new Set(filteredData.map((d) => d.userId.toString()))
    );
    // query db for student ids
    return (
      API.findAllMatching('user', ['_id'], userIds)
        .then((res) => {
          return res.data.results.reduce(
            (acc, curr) => ({
              ...acc,
              [curr._id.toString()]:
                (curr.metadata && curr.metadata.identifier) || null,
            }),
            {}
          );
        })
        .then((studentIds) => {
          return data.map((d) => {
            const currRoom = populatedRooms.filter(
              ({ data: room }) => room._id === d.roomId
            );
            const roomName = currRoom[0].data.name;
            return {
              ...d,
              studentId: studentIds[d.userId],
              roomName,
            };
          });
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.log(err))
    );
  };

  useEffect(() => {
    if (!populatedRooms.some((query) => !query.isSuccess) && loading) {
      setLoading(false);
      if (combinedLog && combinedLog.length > 0)
        dispatch({ type: 'GENERATE_COURSE_DATA', data: combinedLog });
    }
  }, [combinedLog.length]);

  useEffect(() => {
    // augment filteredData
    if (!loading) {
      augmentFilteredData(filteredData).then(
        // eslint-disable-next-line no-return-assign
        (results) => (augmentedData.current = results)
      );
    }
  }, [loading]);

  return combinedLog && combinedLog.length > 0 ? (
    <div>
      Click here to download events from all rooms in this course:&nbsp;
      <Button
        theme="None"
        key="2"
        data-testid="download-csv"
        click={() => exportCSV(augmentedData.current, `${name}_courseData`)}
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
  roomIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string.isRequired,
};

export default CourseStats;
