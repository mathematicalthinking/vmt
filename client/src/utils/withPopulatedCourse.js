import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import API from 'utils/apiRequests';
import { createdCourse } from 'store/actions';

function withPopulatedCourse(WrappedComponent) {
  function PopulatedCourse(props) {
    const { match, history } = props;
    const dispatch = useDispatch();
    const course = useSelector(
      (state) => state.courses.byId[match.params.course_id]
    );

    const { isSuccess, data: populatedCourse, error, isError } = useQuery(
      match.params.course_id,
      () =>
        API.getPopulatedById('courses', match.params.course_id).then(
          (res) => res.data.result
        ),
      // if this user already has access to a course in the Redux store, use it.
      { enabled: !course }
    );

    if (isError) {
      console.log(error);
    }

    React.useEffect(() => {
      if (isSuccess && populatedCourse && !course) {
        dispatch(createdCourse(populatedCourse));
      }
    }, [isSuccess, populatedCourse, course, dispatch]);

    return <WrappedComponent history={history} match={match} />;
  }

  PopulatedCourse.propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({ course_id: PropTypes.string }),
    }).isRequired,
    history: PropTypes.shape({}).isRequired,
  };

  return PopulatedCourse;
}

export default withPopulatedCourse;
