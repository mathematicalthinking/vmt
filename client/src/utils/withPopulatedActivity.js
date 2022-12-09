import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import API from 'utils/apiRequests';

function withPopulatedActivity(WrappedComponent) {
  function PopulatedActivity(props) {
    const { match, history } = props;
    const { isSuccess, data, error, isError } = useQuery(
      match.params.activity_id,
      () => API.getPopulatedById('activities', match.params.activity_id),
      { refresh: 10000 }
    );

    if (isError) {
      console.log(error);
    }

    const populatedActivity = isSuccess
      ? data.data.result
      : { _id: match.params.activity_id, activities: [], rooms: [] }; // do i need the 2nd activities array? probably not

    return (
      <WrappedComponent
        activity={populatedActivity}
        history={history}
        match={match}
      />
    );
  }

  PopulatedActivity.propTypes = {
    match: PropTypes.shape({}).isRequired,
    history: PropTypes.shape({}).isRequired,
  };

  return PopulatedActivity;
}

export default withPopulatedActivity;
