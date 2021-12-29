import React from 'react';
import { usePopulatedRoom } from 'utils';
import RoomLobby from './RoomLobby';

export default function Room(props) {
  const { match } = props;
  const { room_id } = match.params;
  const { isSuccess, data } = usePopulatedRoom(room_id, false, {
    refresh: 10000,
  });

  return <RoomLobby {...props} room={isSuccess ? data : undefined} />;
}
