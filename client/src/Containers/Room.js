import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { usePopulatedRoom } from 'utils';
import RoomLobby from './RoomLobby';

function Room(props) {
  const { room } = props;
  // const { room_id } = match.params;
  // const { isSuccess, data } = usePopulatedRoom(room_id, false);
  // const updatedRoom = isSuccess ? { ...room, ...data } : room;

  // Global live update of Room from the DB was too resource intensive. Plus, it stopped the Redux-based updates
  // (e.g., changes to the UI when a member was added). For now, removing the live update, which means that the Room Details
  // won't ever update unless you refresh the screen.
  return <RoomLobby {...props} room={room} />;
}

Room.propTypes = {
  room: PropTypes.shape({}),
  // history: PropTypes.shape({}).isRequired,
  // match: PropTypes.shape({}).isRequired,
};

Room.defaultProps = {
  room: null,
};

const mapStateToProps = (state, ownProps) => {
  // eslint-disable-next-line camelcase
  const { room_id } = ownProps.match.params;
  return {
    room: state.rooms.byId[room_id],
  };
};

export default connect(mapStateToProps)(Room);
