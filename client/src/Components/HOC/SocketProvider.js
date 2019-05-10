import React, { Component, Fragment } from 'react';
import socket from '../../utils/sockets';
import { normalize } from '../../store/utils';
import { connect } from 'react-redux';
import { capitalize } from 'lodash';
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
import { createNtfMessage } from './socketProvider.utils';
class SocketProvider extends Component {
  state = {
    initializedCount: 0,
    ntfMessage: '',
    showNtfMessage: false,
  };
  componentDidMount() {
    // setTimeout(() => this.setState({ showNtfMessage: true }), 2000);
    if (this.props.user.loggedIn) {
      this.props.clearError(); // get rid of any lingering errors in the store from their last session
      this.props.getUser(this.props.user._id);
      socket.on('connect', () => {
        // @TODO consider doing this on the backend...we're trgin to make sure the socketId stored on the user obj in the db is fresh.
        // Why dont we just, every time a socket connects on the backend, grab the user obj and go update their socketId
        let userId = this.props.user._id;
        let socketId = socket.id;
        socket.emit('SYNC_SOCKET', { socketId, userId }, (res, err) => {
          if (err) {
            //something went wrong updatnig user socket
            // THIS MEANS WE WONT GET NOTIFICATIONS
            // HOW SHOULD WE HANDLE THIS @TODO
            return;
          }
          this.props.updateUser({ connected: true });
        });
        this.initializeListeners();
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.props.user.loggedIn && nextProps.user.loggedIn) {
      return true;
    } else if (nextState !== this.state) {
      return true;
    } else return false;
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.user.loggedIn && this.props.user.loggedIn) {
      this.props.clearError();
      let userId = this.props.user._id;
      let socketId = socket.id;
      socket.emit('SYNC_SOCKET', { socketId, userId }, (res, err) => {
        if (err) {
          this.props.updateUser({ connected: false });
          return;
        }
        this.props.updateUser({ connected: true });
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

  initializeListeners() {
    socket.removeAllListeners();
    socket.on('NEW_NOTIFICATION', data => {
      let { notification, course, room } = data;
      let type = notification.notificationType;
      let resource = notification.resourceType;
      let message = null;
      if (notification.isTrashed) {
        this.props.getUser(this.props.user._id);
        // message =
      } else {
        this.props.addNotification(notification);
        message = createNtfMessage(notification, course, room, {
          courses: this.props.courses,
          rooms: this.props.rooms,
        });
        if (type === 'newMember') {
          // add new member to room/course//
          let actionName = `add${capitalize(resource)}Member`;
          let { _id, username } = notification.fromUser;
          this.props[actionName](notification.resourceId, {
            user: { _id, username },
            role: 'participant',
          });
        }
        if (course) {
          let normalizedCourse = normalize([course]);
          this.props.gotCourses(normalizedCourse);
          this.props.addUserCourses([course._id]);
        }

        if (room) {
          let normalizedRoom = normalize([room]);
          this.props.gotRooms(normalizedRoom, true);
          this.props.addUserRooms([room._id]);
          if (room.course) {
            this.props.addCourseRooms(room.course, [room._id]);
          }
        }
      }
      if (message) {
        this.showNtfToast(message);
      }
    });

    socket.on('disconnect', () => {
      this.props.updateUser({ connected: false });
    });

    socket.on('reconnect', attemptNumber => {
      let userId = this.props.user._id;
      let socketId = socket.id;
      socket.emit('SYNC_SOCKET', { socketId, userId }, (res, err) => {
        if (err) {
          //something went wrong updatnig user socket
          // HOW SHOULD WE HANDLE THIS @TODO
          return;
        }
      });
      // console.log('reconnected after ', attemptNumber, ' attempts')
      // MAYBE FETCH THE USER TO GET MISSING NOTIFICATIONS AND THE LIKE
      this.props.getUser(this.props.user._id);
      this.props.updateUser({ connected: true });
    });
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
  render() {
    return (
      <Fragment>
        {this.props.children}
        <div
          className={
            this.state.showNtfMessage ? classes.Visible : classes.Hidden
          }
        >
          <Notification size="small" />
          {this.state.ntfMessage}
        </div>
      </Fragment>
    );
  }
}

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
    addNotification,
    // removeNotification,
    addUserCourses,
    getUser,
    addUserRooms,
    gotCourses,
    gotRooms,
    addCourseRooms,
    addRoomMember,
    addCourseMember,
    updateUser,
    clearError,
  }
)(SocketProvider);
