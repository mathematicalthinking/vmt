import React from "react";
import { connect } from "react-redux";
import { fail } from "../../store/actions/loading";
import { Route, Redirect } from "react-router-dom";

const privateRoute = ({
  component: Component,
  authed,
  redirectPath,
  fail,
  ...rest
}) => {
  if (redirectPath === "/signup" && !authed) {
    fail("You need to be signed in to access this resource");
  }
  return (
    <Route
      {...rest}
      render={props =>
        authed === true ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: redirectPath || "/",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};

export default connect(
  null,
  { fail }
)(privateRoute);
