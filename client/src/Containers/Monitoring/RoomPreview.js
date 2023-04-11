import React from 'react';
import PropTypes from 'prop-types';
import { usePopulatedRoom } from 'utils/utilityHooks';
import RoomViewer from './RoomViewer';
import classes from './monitoringView.css';

/**
 * The RoomPreview provides a snapshot of a room, with the main math space (as a Thumbnail), Chat, and Attendance views.
 */

function RoomPreview({ roomId }) {
  const { isSuccess, data } = usePopulatedRoom(roomId, false, {
    refetchInterval: 10000, // check for new info every 10 seconds
  });

  const minimalRoom = { members: [], currentMembers: [], chat: [], tabs: [] };

  return (
    <div style={{ position: 'relative', minHeight: '50vh', minWidth: '80vw' }}>
      <RoomViewer populatedRoom={isSuccess ? data : minimalRoom} />
      {!isSuccess && <div className={classes.Spinner} />}
    </div>
  );
}

RoomPreview.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default RoomPreview;
