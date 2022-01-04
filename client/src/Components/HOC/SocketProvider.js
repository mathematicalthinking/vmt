import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { capitalize } from 'lodash';
import socket from '../../utils/sockets';
import { normalize } from '../../store/utils';
import {
  addNotification,
  addUserCourses,
  addUserRooms,
  gotCourses,
  gotRooms,
  getUser,
  addCourseRooms,
  addRoomMember,
  addCourseMember,
  updateUser,
  clearError,
  logout,
} from '../../store/actions';
import Notification from '../Notification/Notification';
import classes from './socketProvider.css';
import createNtfMessage from './socketProvider.utils';

class SocketProvider extends Component {
  state = {
    ntfMessage: '',
    showNtfMessage: false,
  };

  componentDidMount() {
    const { user, connectClearError, connectGetUser } = this.props;
    const url = window.location.href;
    const isForConfirmEmail = url.includes('confirmEmail');
    const isForResetPassword = url.includes('resetPassword');
    const isForForgotPassword = url.includes('forgotPassword');

    if (user.loggedIn) {
      connectClearError(); // get rid of any lingering errors in the store from their last session
      if (!isForConfirmEmail) {
        connectGetUser(user._id);
      }
      console.log('Comp mounted and socket synced!');
      this.syncSocket('mounting');
      this.initializeListeners();
    } else if (
      !isForConfirmEmail &&
      !isForForgotPassword &&
      !isForResetPassword
    ) {
      // this seems necessary for the case where user has vmt open while logged out
      // then logs into encompass in a different tab or browser
      // then refreshing vmt should recognize that the user is now logged in
      if (!window.Cypress) {
        connectGetUser();
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { user, rooms, courses } = this.props;
    if (!user.loggedIn && nextProps.user.loggedIn) {
      return true;
    }
    if (nextState !== this.state) {
      return true;
    }
    if (nextProps.rooms !== rooms || nextProps.courses !== courses) return true;
    return false;
  }

  componentDidUpdate(prevProps) {
    const { user, connectClearError, roomsArr, courses } = this.props;
    if (!prevProps.user.loggedIn && user.loggedIn) {
      connectClearError();
      console.log('Component updated and socket synced!');
      this.syncSocket('updating');
    }
    // Reinitialize listeners if store changes
    if (
      prevProps.roomsArr.length !== roomsArr.length ||
      prevProps.courses !== courses
    ) {
      // N.B. reinitializing listeners whil user is in the workspace will break their connection
      this.initializeListeners();
    }
  }

  componentWillUnmount() {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    socket.removeAllListeners();
  }

  syncSocket = (location) => {
    const {
      connectUpdateUser,
      user: { _id, sockedId },
    } = this.props;
    if (sockedId !== socket.id) {
      socket.emit('SYNC_SOCKET', _id, (res, err) => {
        if (err) {
          console.log('UNABLE TO SYNC SOCKET NOTIFCATIONS MAY NOT BE WORKING');
          return;
        }
        console.log(res);
        connectUpdateUser({ connected: true });
        this.initializeListeners();
      });
    }
  };

  showNtfToast = (ntfMessage) => {
    this.setState({ showNtfMessage: true, ntfMessage }, () => {
      this.toastTimer = setTimeout(() => {
        this.setState({
          showNtfMessage: false,
          ntfMessage: '',
        });
      }, 3500);
    });
  };

  initializeListeners() {
    const {
      connectAddNotification,
      connectGotCourses,
      connectGotRooms,
      connectGetUser,
      connectUpdateUser,
      connectAddUserCourses,
      connectAddUserRooms,
      courses,
      rooms,
      user,
      connectLogout,
    } = this.props;
    socket.removeAllListeners('NEW_NOTIFICATION');
    socket.removeAllListeners('FORCED_LOGOUT');
    socket.io.removeAllListeners('disconnect');
    socket.io.removeAllListeners('reconnect');

    socket.on('NEW_NOTIFICATION', (data) => {
      const { notification, course, room } = data;
      const type = notification.notificationType;
      const resource = notification.resourceType;
      let message = null;
      if (notification.isTrashed) {
        connectGetUser(user._id);
      } else {
        connectAddNotification(notification);
        message = createNtfMessage(notification, course, room, {
          courses,
          rooms,
        });
        if (type === 'newMember') {
          // add new member to room/course//
          const actionName = `connectAdd${capitalize(resource)}Member`;
          const { _id, username } = notification.fromUser;
          // eslint-disable-next-line react/destructuring-assignment
          this.props[actionName](notification.resourceId, {
            user: { _id, username },
            role: 'participant',
          });
        }
        if (course) {
          const normalizedCourse = normalize([course]);
          connectGotCourses(normalizedCourse);
          connectAddUserCourses([course._id]);
        }

        if (room) {
          const normalizedRoom = normalize([room]);
          connectGotRooms(normalizedRoom, true);
          connectAddUserRooms([room._id]);
          if (room.course) {
            addCourseRooms(room.course, [room._id]);
          }
        }
      }
      if (message) {
        this.showNtfToast(message);
      }
    });

    socket.io.on('disconnect', () => {
      connectUpdateUser({ connected: false });
    });

    socket.io.on('reconnect', () => {
      console.log('Reconnected and socket synced!');
      this.syncSocket('reconnect');
      // connectGetUser(user._id);
    });

    socket.on('FORCED_LOGOUT', () => {
      connectLogout();
    });
  }

  render() {
    const { children } = this.props;
    const { showNtfMessage, ntfMessage } = this.state;
    return (
      <Fragment>
        {children}
        <div className={showNtfMessage ? classes.Visible : classes.Hidden}>
          <Notification size="small" />
          {ntfMessage}
        </div>
      </Fragment>
    );
  }
}

SocketProvider.propTypes = {
  user: PropTypes.shape({ loggedIn: PropTypes.bool.isRequired }).isRequired,
  courses: PropTypes.shape({}).isRequired,
  rooms: PropTypes.shape({}).isRequired,
  roomsArr: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
  connectAddNotification: PropTypes.func.isRequired,
  connectAddUserCourses: PropTypes.func.isRequired,
  connectGetUser: PropTypes.func.isRequired,
  connectAddUserRooms: PropTypes.func.isRequired,
  connectGotCourses: PropTypes.func.isRequired,
  connectGotRooms: PropTypes.func.isRequired,
  connectUpdateUser: PropTypes.func.isRequired,
  connectClearError: PropTypes.func.isRequired,
  connectLogout: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    rooms: state.rooms.byId,
    roomsArr: state.rooms.allIds,
    courses: state.courses.byId,
  };
};

export default connect(
  mapStateToProps,
  {
    connectAddNotification: addNotification,
    connectAddUserCourses: addUserCourses,
    connectGetUser: getUser,
    connectAddUserRooms: addUserRooms,
    connectGotCourses: gotCourses,
    connectGotRooms: gotRooms,
    connectAddCourseRooms: addCourseRooms,
    connectAddRoomMember: addRoomMember,
    connectAddCourseMember: addCourseMember,
    connectUpdateUser: updateUser,
    connectClearError: clearError,
    connectLogout: logout,
  }
)(SocketProvider);
