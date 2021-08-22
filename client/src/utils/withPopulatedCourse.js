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
      const { history, match } = this.props;
      const { loading } = this.state;
      if (loading) {
        return <Loading message="Fetching your course..." />;
      }

      return (
        <WrappedComponent
          course={this.populatedCourse}
          history={history}
          match={match}
        />
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
