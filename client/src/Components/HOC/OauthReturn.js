import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { getUser } from '../../store/actions';
import SmallLoading from '../Loading/SmallLoading';

class OauthReturn extends Component {
  componentDidMount() {
    const { connectGetUser } = this.props;
    connectGetUser();
  }

  render() {
    const { loggedIn, errorMessage, loading, location } = this.props;
    if (loggedIn) {
      return <Redirect to="/myVMT/rooms" />;
    }

    if (errorMessage) {  
      // oauth return might receive an error from mt-sso that stops the login
      // make sure to pass it along
      return <Redirect to={`/login/${location.search}`} />;
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

export default withRouter(
  connect(
    mapStateToProps,
    {
      connectGetUser: getUser,
    }
  )(OauthReturn));