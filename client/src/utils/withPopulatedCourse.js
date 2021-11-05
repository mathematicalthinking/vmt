import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import API from 'utils/apiRequests';

function withPopulatedCourse(WrappedComponent) {
  function PopulatedCourse(props) {
    const { match, history } = props;
    const { isSuccess, data, error, isError } = useQuery(
      match.params.course_id,
      () => API.getPopulatedById('courses', match.params.course_id),
      { refresh: 10000 }
    );

    if (isError) {
      console.log(error);
    }

    const populatedCourse = isSuccess
      ? data.data.result
      : { _id: match.params.course_id, activities: [], rooms: [] };

    return (
      <WrappedComponent
        course={populatedCourse}
        history={history}
        match={match}
      />
    );
  }

  PopulatedCourse.propTypes = {
    match: PropTypes.shape({}).isRequired,
    history: PropTypes.shape({}).isRequired,
  };

  return PopulatedCourse;
}

export default withPopulatedCourse;
