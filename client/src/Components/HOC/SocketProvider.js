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
    const {
      user,
      connectClearError,
      connectGetUser,
      connectUpdateUser,
    } = this.props;
    // setTimeout(() => this.setState({ showNtfMessage: true }), 2000);
    if (user.loggedIn) {
      connectClearError(); // get rid of any lingering errors in the store from their last session
      connectGetUser(user._id);
      socket.on('connect', () => {
        // @TODO consider doing this on the backend...we're trgin to make sure the socketId stored on the user obj in the db is fresh.
        // Why dont we just, every time a socket connects on the backend, grab the user obj and go update their socketId
        const userId = user._id;
        const socketId = socket.id;
        socket.emit('SYNC_SOCKET', { socketId, userId }, (res, err) => {
          if (err) {
            // something went wrong updatnig user socket
            // THIS MEANS WE WONT GET NOTIFICATIONS
            // HOW SHOULD WE HANDLE THIS @TODO
            return;
          }
          connectUpdateUser({ connected: true });
        });
        this.initializeListeners();
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { user } = this.props;
    if (!user.loggedIn && nextProps.user.loggedIn) {
      return true;
    }
    if (nextState !== this.state) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps) {
    const { user, connectClearError, connectUpdateUser } = this.props;
    if (!prevProps.user.loggedIn && user.loggedIn) {
      connectClearError();
      const userId = user._id;
      const socketId = socket.id;
      socket.emit('SYNC_SOCKET', { socketId, userId }, (res, err) => {
        if (err) {
          connectUpdateUser({ connected: false });
          return;
        }
        connectUpdateUser({ connected: true });
      });
      // socket.removeAllListeners();
      this.initializeListeners();
    }
  }

  componentWillUnmount() {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    socket.removeAllListeners();
  }

  showNtfToast = ntfMessage => {
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
    } = this.props;
    socket.removeAllListeners();
    socket.on('NEW_NOTIFICATION', data => {
      const { notification, course, room } = data;
      const type = notification.notificationType;
      const resource = notification.resourceType;
      let message = null;
      if (notification.isTrashed) {
        connectGetUser(user._id);
        // message =
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

    socket.on('disconnect', () => {
      updateUser({ connected: false });
    });

    socket.on('reconnect', () => {
      const userId = user._id;
      const socketId = socket.id;
      socket.emit('SYNC_SOCKET', { socketId, userId }, (res, err) => {
        if (err) {
          // something went wrong updatnig user socket
          // HOW SHOULD WE HANDLE THIS @TODO
          // return;
        }
      });
      // console.log('reconnected after ', attemptNumber, ' attempts')
      // MAYBE FETCH THE USER TO GET MISSING NOTIFICATIONS AND THE LIKE
      connectGetUser(user._id);
      connectUpdateUser({ connected: true });
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
  children: PropTypes.node.isRequired,
  connectAddNotification: PropTypes.func.isRequired,
  connectAddUserCourses: PropTypes.func.isRequired,
  connectGetUser: PropTypes.func.isRequired,
  connectAddUserRooms: PropTypes.func.isRequired,
  connectGotCourses: PropTypes.func.isRequired,
  connectGotRooms: PropTypes.func.isRequired,
  // connectAddCourseRooms: PropTypes.func.isRequired,
  // connectAddRoomMember: PropTypes.func.isRequired,
  // connectAddCourseMember: PropTypes.func.isRequired,
  connectUpdateUser: PropTypes.func.isRequired,
  connectClearError: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    user: state.user,
    rooms: state.rooms.byId,
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
  }
)(SocketProvider);
