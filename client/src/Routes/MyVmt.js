import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import withPopulatedCourse from 'utils/withPopulatedCourse';
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
} from '../Containers';
import SharedReplayer from '../Containers/Replayer/SharedReplayer';
import { PrivateRoute, ErrorToast, Loading } from '../Components';
import { Confirmation, FacilitatorIntro } from '../Layout';
import ErrorBoundary from '../ErrorBoundary';
import { updateUser } from '../store/actions/user';

const pages = [
  { path: '/', component: MyVMT },
  { path: '/facilitator', component: FacilitatorIntro },
  { path: '/profile', component: Profile },
  { path: '/:resource', component: MyVMT },
  {
    path: '/courses/:course_id/:resource',
    component: withPopulatedCourse(Course), // provide the course from the DB to allow facilitators to see all resources
    redirectPath: '/classcode',
  },
  {
    path: '/courses/:course_id/activities/:activity_id/:resource',
    component: Activity,
    redirectPath: '/classcode',
  },
  {
    path: '/courses/:course_id/rooms/:room_id/:resource',
    component: Room,
    redirectPath: '/classcode',
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
    component: withPopulatedRoom(SharedReplayer),
    redirectPath: '/signup',
  },
  {
    path: '/workspace/:activity_id/activity',
    component: ActivityWorkspace,
    redirectPath: '/signup',
  },
  {
    path: '/workspace/:room_id',
    component: withPopulatedRoom(Workspace),
    redirectPath: '/signup',
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

  // when a user has a large redux store, reloading the takes seconds to
  //  populate the store. Therefore, a user can be logged in but not registered
  //  as such in the store. When a user is logged in and refreshes, the cookie
  //  is immediately available.
  const actuallyLoggedIn =
    process.env.NODE_ENV !== 'development'
      ? document.cookie.indexOf('mt_sso_') > -1
      : loggedIn;

  const doRedirectToUnconfirmed =
    actuallyLoggedIn && email.length > 0 && !isEmailConfirmed;

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
              authed={actuallyLoggedIn && !doRedirectToUnconfirmed}
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
          component={withPopulatedRoom(TempWorkspace)}
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
