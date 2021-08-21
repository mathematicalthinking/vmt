import React, { Component } from 'react';
import PropTypes from 'prop-types';
import API from 'utils/apiRequests';
import Loading from 'Components/Loading/Loading';

function withPopulatedCourse(WrappedComponent) {
  class PopulatedCourse extends Component {
    state = {
      loading: true,
    };

    componentDidMount() {
      this.cancelFetch = false;
      const { match } = this.props;
      API.getPopulatedById('courses', match.params.course_id)
        .then((res) => {
          this.populatedCourse = res.data.result;
          if (!this.cancelFetch) this.setState({ loading: false });
        })
        .catch(() => {
          console.log(
            'we should probably just go back to the previous page? maybe display the error'
          );
        });
    }

    componentWillUnmount() {
      this.cancelFetch = true;
    }

    render() {
      const { history } = this.props;
      const { loading } = this.state;
      if (loading) {
        return <Loading message="Fetching your course..." />;
      }

      return (
        <WrappedComponent course={this.populatedCourse} history={history} />
      );
    }
  }

  PopulatedCourse.propTypes = {
    match: PropTypes.shape({}).isRequired,
    history: PropTypes.shape({}).isRequired,
  };

  return PopulatedCourse;
}

export default withPopulatedCourse;

// const isFacilitor = (user, course) => {
//     if (!course.members) return false;
//     const member = course.members.find((m) => m.user._id === user._id);
//     if (!member) return false;
//     return member.role === 'facilitator';
//   };

//   const populateCourse = async (store, course_id) => {
//     const course = store.courses.byId[course_id];
//     if (!course) return null;

//     return isFacilitor(store.user, course)
//       ? API.getPopulatedById('courses', course_id)
//       : populateResource(store, 'courses', course_id, ['activities', 'rooms']);
//   };

//   const mapStateToProps = (store, ownProps) => {
//     // eslint-disable-next-line camelcase
//     const { course_id } = ownProps.match.params;
//     const mapping = {
//       activities: store.activities.allIds,
//       rooms: store.rooms.allIds,
//       user: store.user,
//       // notifications: store.user.courseNotifications.access,
//       notifications: getUserNotifications(store.user, null, 'course'),
//       loading: store.loading.loading,
//     };
//     return {
//       course: store.courses.byId[course_id]
//         ? populateCourse(store, course_id)
//         : null,
//     };
//   };
