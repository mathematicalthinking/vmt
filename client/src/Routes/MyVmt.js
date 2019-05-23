import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import Navbar from '../Components/Navigation/Navbar';
import {
  MyVMT,
  Course,
  Activity,
  Room,
  Workspace,
  Replayer,
  Profile,
  ActivityWorkspace,
} from '../Containers';
import { PrivateRoute, ErrorToast } from '../Components';
import { Confirmation, FacilitatorInstructions } from '../Layout';
import ErrorBoundary from '../ErrorBoundary';

const pages = [
  { path: '/facilitator', component: FacilitatorInstructions },
  { path: '/profile', component: Profile },
  { path: '/:resource', component: MyVMT },
  {
    path: '/courses/:course_id/:resource',
    component: Course,
    redirectPath: '/signup',
  },
  {
    path: '/courses/:course_id/activities/:activity_id/:resource',
    component: Activity,
    redirectPath: '/signup',
  },
  {
    path: '/courses/:course_id/rooms/:room_id/:resource',
    componeny: Room,
    redirectPath: '/signup',
  },
  {
    path: '/rooms/:room_id/:resource',
    component: Room,
    redirectPath: '/signup',
  },
  {
    path: '/activities/:activity_id/:resource',
    component: Activity,
    redirectPath: '/signup',
  },
  {
    path: '/workspace/:room_id/replayer',
    component: Replayer,
    redirectPath: '/signup',
  },
  {
    path: '/workspace/:activity_id/activity',
    component: ActivityWorkspace,
    redirectPath: '/signup',
  },
  {
    path: '/workspace/:room_id',
    component: Workspace,
    redirectPath: '/signup',
  },
  {
    path: '/confirmation',
    component: Confirmation,
  },
];
class MyVmt extends Component {
  render() {
    const { match, loggedIn, fail, user, globalErrorMessage } = this.props;
    const { path } = match;
    return (
      <ErrorBoundary dispatchFail={fail}>
        <Navbar user={user} />
        <Switch>
          {pages.map(page => (
            <PrivateRoute
              exact
              key={page.path}
              path={`${path}/${page.path}`}
              authed={loggedIn}
              component={page.component}
              redirectPath={page.redirectPath || '/'}
            />
          ))}
          <Route
            path="*"
            render={() => {
              return <div>Error</div>;
              // ^ @TODO 404 page
            }}
          />
        </Switch>
        {globalErrorMessage ? (
          <ErrorToast>{globalErrorMessage}</ErrorToast>
        ) : null}
      </ErrorBoundary>
    );
  }
}

MyVmt.propTypes = {
  match: PropTypes.string.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  fail: PropTypes.func.isRequired,
  user: PropTypes.shape({}),
  globalErrorMessage: PropTypes.string,
};

MyVmt.defaultProps = {
  user: {},
  globalErrorMessage: null,
};
// Provide login status to all private routes
const mapStateToProps = state => ({
  loggedIn: state.user.loggedIn,
  user: state.user,
  globalErrorMessage: state.loading.globalErrorMessage,
});

export default connect(
  mapStateToProps,
  null
)(MyVmt);
