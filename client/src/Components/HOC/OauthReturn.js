import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { getUser } from '../../store/actions';
import SmallLoading from '../Loading/SmallLoading';

class OauthReturn extends Component {
  componentDidMount() {
    const { connectGetUser } = this.props;
    connectGetUser();
  }

  render() {
    const { loggedIn, errorMessage, loading } = this.props;

    if (loggedIn) {
      return <Redirect to="/myVMT/rooms" />;
    }

    if (errorMessage) {
      return <Redirect to="/login" />;
    }

    return <Fragment>{loading ? <SmallLoading /> : null}</Fragment>;
  }
}

OauthReturn.propTypes = {
  loggedIn: PropTypes.bool,
  connectGetUser: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  loading: PropTypes.bool,
};

OauthReturn.defaultProps = {
  loggedIn: false,
  errorMessage: null,
  loading: false,
};
const mapStateToProps = (state) => {
  return {
    loggedIn: state.user.loggedIn,
    errorMessage: state.loading.errorMessage,
    loading: state.loading.loading,
  };
};

export default connect(
  mapStateToProps,
  {
    connectGetUser: getUser,
  }
)(OauthReturn);
