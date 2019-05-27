import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { fail } from '../../store/actions/loading';

const privateRoute = ({
  component: Component,
  authed,
  redirectPath,
  connectFail,
  ...rest
}) => {
  if (redirectPath === '/signup' && !authed) {
    fail('You need to be signed in to access this resource');
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
              pathname: redirectPath || '/',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

privateRoute.propTypes = {
  component: PropTypes.element.isRequired,
  authed: PropTypes.bool,
  redirectPath: PropTypes.string,
  connectFail: PropTypes.func.isRequired,
};

privateRoute.defaultProps = {
  authed: false,
  redirectPath: '/',
};

export default connect(
  null,
  { connectFail: fail }
)(privateRoute);
