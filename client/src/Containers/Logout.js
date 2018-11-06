import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../store/actions'

const Logout = props => {
  console.log('we in here')
  props.logout()
  return (
    <Redirect to="/" />
  )
}

export default connect(null, { logout })(Logout)