import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import API from '../../utils/apiRequests';
import buildLog from '../../utils/buildLog';
import Loading from '../../Components/Loading/Loading';

function withPopulatedRoom(WrappedComponent) {
  function PopulatedRoom(props) {
    const { match, history } = props;
    const { isLoading, isSuccess, data, error, isError } = useQuery(
      match.params.room_id,
      async () => {
        // eslint-disable-next-line no-return-await
        const { data: response } = await API.getPopulatedById(
          'rooms',
          match.params.room_id,
          false,
          true
        );
        return response;
      }
    );

    if (isLoading) {
      return <Loading message="Fetching your room..." />;
    }

    if (isSuccess && data.result) {
      const populatedRoom = data.result;
      populatedRoom.log = buildLog(populatedRoom.tabs, populatedRoom.chat);
      return (
        <WrappedComponent populatedRoom={populatedRoom} history={history} />
      );
    }

    if (isError) {
      console.log(error);
    }
  }

  PopulatedRoom.propTypes = {
    match: PropTypes.shape({}).isRequired,
    history: PropTypes.shape({}).isRequired,
  };

  return PopulatedRoom;
}

export default withPopulatedRoom;
