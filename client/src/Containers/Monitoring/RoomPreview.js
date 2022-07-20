import React from 'react';
import PropTypes from 'prop-types';
import { usePopulatedRoom } from 'utils/utilityHooks';
import { Loading } from 'Components';
import RoomViewer from './RoomViewer';

/**
 * The RoomPreview provides a snapshot of a room, with the main math space (as a Thumbnail), Chat, and Attendance views.
 */

function RoomPreview({ roomId }) {
  const { isSuccess, data } = usePopulatedRoom(roomId, false, {
    refetchInterval: 10000, // check for new info every 10 seconds
  });

  return isSuccess ? <RoomViewer populatedRoom={data} /> : <Loading />;
}

RoomPreview.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default RoomPreview;
