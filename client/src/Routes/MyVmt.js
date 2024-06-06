import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withControlMachine, withPopulatedActivity } from 'utils';
import Navbar from '../Components/Navigation/Navbar';
import {
  MyVMT,
  Course,
  Activity,
  Room,
  Profile,
  ActivityWorkspace,
  Workspace,
  TempWorkspace,
  withPopulatedRoom,
  Dashboard,
  AdminMonitor,
} from '../Containers';
import SharedReplayer from '../Containers/Replayer/SharedReplayer';
import { PrivateRoute, ErrorToast } from '../Components';
import { Confirmation, FacilitatorIntro } from '../Layout';
import ErrorBoundary from '../ErrorBoundary';
import { updateUser } from '../store/actions/user';

const pages = [
  { path: '/', component: MyVMT },
  { path: '/facilitator', component: FacilitatorIntro },
  { path: '/profile', component: Profile },
  { path: '/adminMonitor', component: AdminMonitor },
  { path: '/:resource', component: MyVMT },
  {
    path: '/courses/:course_id/:resource',
    component: Course,
    redirectPath: '/',
  },
  {
    path: '/courses/:course_id/activities/:activity_id/:resource',
    // component: Activity,
    component: withPopulatedActivity(Activity),
    redirectPath: '/',
  },
  {
    path:
      '/courses/:course_id/activities/:activity_id/rooms/:room_id/:resource',
    component: Room,
    redirectPath: '/',
  },
  {
    path: '/activities/:activity_id/rooms/:room_id/:resource',
    component: Room,
    redirectPath: '/',
  },
  {
    path: '/courses/:course_id/rooms/:room_id/:resource',
    component: Room,
    redirectPath: '/',
  },
  {
    path: '/courses/:course_id/rooms/:room_id/:resource',
    component: Room,
    redirectPath: '/',
  },
  {
    path: '/rooms/:room_id/:resource',
    component: Room,
    redirectPath: '/',
  },
  {
    path: '/activities/:activity_id/:resource',
    // component: Activity,
    component: withPopulatedActivity(Activity),
    redirectPath: '/',
  },
  {
    path: '/workspace/:room_id/replayer',
    component: withPopulatedRoom(SharedReplayer),
    redirectPath: '/',
  },
  {
    path: '/workspace/:activity_id/activity',
    component: ActivityWorkspace,
    redirectPath: '/',
  },
  {
    path: '/workspace/:room_id',
    component: withPopulatedRoom(withControlMachine(Workspace)),
    redirectPath: '/',
  },
  {
    path: '/confirmation',
    component: Confirmation,
  },
  {
    path: '/dashboard/:resource',
    component: Dashboard,
  },
];
const MyVmt = ({
  match,
  loggedIn,
  user,
  globalErrorMessage,
  connectUpdateUser,
}) => {
  const toggleAdmin = () => {
    connectUpdateUser({ inAdminMode: !user.inAdminMode });
  };

  const { path } = match;
  const { email, isEmailConfirmed } = user;

  const doRedirectToUnconfirmed =
    loggedIn && email.length > 0 && !isEmailConfirmed;

  return (
    <ErrorBoundary>
      <Navbar user={user} toggleAdmin={toggleAdmin} />
      <Switch>
        {pages.map((page) => {
          return (
            <PrivateRoute
              exact
              key={page.path}
              path={`${path}${page.path}`}
              authed={loggedIn && !doRedirectToUnconfirmed}
              component={page.component}
              redirectPath={
                doRedirectToUnconfirmed
                  ? '/unconfirmed'
                  : page.redirectPath || '/'
              }
            />
          );
        })}
        <Route
          path={`${path}/explore/:room_id`}
          component={withPopulatedRoom(withControlMachine(TempWorkspace))}
        />
        <Route
          path="*"
          component={
            () => <div>Error</div>
            // ^ @TODO 404 page ...will never hit due to resource wildcard
          }
        />
      </Switch>
      {globalErrorMessage ? (
        <ErrorToast>{globalErrorMessage}</ErrorToast>
      ) : null}
    </ErrorBoundary>
  );
};

MyVmt.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  loggedIn: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    inAdminMode: PropTypes.bool,
    isEmailConfirmed: PropTypes.bool,
    email: PropTypes.string,
  }),
  globalErrorMessage: PropTypes.string,
  connectUpdateUser: PropTypes.func.isRequired,
};

MyVmt.defaultProps = {
  user: {},
  globalErrorMessage: null,
};
// Provide login status to all private routes
const mapStateToProps = (state) => ({
  loggedIn: state.user.loggedIn,
  user: state.user,
  globalErrorMessage: state.loading.globalErrorMessage,
});

export default connect(mapStateToProps, {
  connectUpdateUser: updateUser,
})(MyVmt);
