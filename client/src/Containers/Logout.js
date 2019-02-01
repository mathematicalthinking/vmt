import React from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { logout } from "../store/actions";

const Logout = props => {
  sessionStorage.clear();
  props.logout();
  // window.location.reload(true)
  return <Redirect to="/myVMT/courses" />;
};

export default connect(
  null,
  { logout }
)(Logout);
