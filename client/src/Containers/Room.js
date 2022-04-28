import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { usePopulatedRoom } from 'utils';
import RoomLobby from './RoomLobby';

function Room(props) {
  const { match, room } = props;
  const { room_id } = match.params;
  const { isSuccess, data } = usePopulatedRoom(room_id, false);

  const updatedRoom = isSuccess ? { ...room, ...data } : room;

  return <RoomLobby {...props} room={updatedRoom} />;
}

Room.propTypes = {
  room: PropTypes.shape({}),
  history: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
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
