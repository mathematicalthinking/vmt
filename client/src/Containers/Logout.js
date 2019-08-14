import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../store/actions';

const Logout = (props) => {
  const { connectLogout } = props;
  window.sessionStorage.clear();
  connectLogout();
  // window.location.reload(true)
  return <Redirect to="/myVMT/courses" />;
};

Logout.propTypes = {
  connectLogout: PropTypes.func.isRequired,
};

export default connect(
  null,
  { connectLogout: logout }
)(Logout);
