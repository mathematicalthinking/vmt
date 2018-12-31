import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../store/actions'

const Logout = props => {
  props.logout()
  return (
    <Redirect to="/myVMT/courses" />
  )
}

export default connect(null, { logout })(Logout)