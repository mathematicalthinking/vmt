import React from 'react';
import PropTypes from 'prop-types';

const Replayers = (props) => {
  const { allRooms, rooms } = props;
  // replayer url: /myVMT/workspace/${roomId}/replayer
  const replayers = () =>
    allRooms &&
    allRooms.length &&
    allRooms.map((room) => {
      return (
        <iframe
          title="replayer"
          key={`room-${room._id}`}
          src={`/myVMT/workspace/${room._id}/replayer`}
          height={500}
          width={window.innerWidth}
        />
      );
    });

  // used to test design of replayer
  const firstReplayer = () =>
    allRooms &&
    allRooms.length && (
      <iframe
        title="replayer"
        key={`room-${allRooms[0]._id}`}
        src={`/myVMT/workspace/${allRooms[0]._id}/replayer`}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    );

  return <div>{replayers()}</div>;
  //   return <div>{firstReplayer()}</div>;
};

Replayers.propTypes = {
  rooms: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string })),
  allRooms: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string })),
};

Replayers.defaultProps = {
  rooms: [],
  allRooms: [],
};

export default Replayers;
