import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import API from 'utils/apiRequests';

function withPopulatedActivity(WrappedComponent) {
  function PopulatedActivity(props) {
    const { match, history } = props;
    const { isSuccess, data, error, isError } = useQuery(
      match.params.activity_id,
      () => API.getPopulatedById('activities', match.params.activity_id)
    );

    if (isError) {
      console.log(error);
    }

    const populatedActivity = isSuccess ? data.data.result : null;

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
