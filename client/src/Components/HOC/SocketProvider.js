import { Component } from "react";
import socket from "../../utils/sockets";
import { normalize } from "../../store/utils/normalize";
import { connect } from "react-redux";
import { capitalize } from "lodash";
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
  updateUser
} from "../../store/actions";

class SocketProvider extends Component {
  state = {
    initializedCount: 0
  };
  componentDidMount() {
    if (this.props.user.loggedIn) {
      this.props.getUser(this.props.user._id);
      socket.on("connect", () => {
        console.log("connected!: ", socket.id);
        // @TODO consider doing this on the backend...we're trgin to make sure the socketId stored on the user obj in the db is fresh.
        // Why dont we just, every time a socket connects on the backend, grab the user obj and go update their socketId
        let userId = this.props.user._id;
        let socketId = socket.id;
        socket.emit("SYNC_SOCKET", { socketId, userId }, (res, err) => {
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

  shouldComponentUpdate(nextProps) {
    if (!this.props.user.loggedIn && nextProps.user.loggedIn) {
      return true;
    } else return false;
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.user.loggedIn && this.props.user.loggedIn) {
      let userId = this.props.user._id;
      let socketId = socket.id;
      socket.emit("SYNC_SOCKET", { socketId, userId }, (res, err) => {
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

  initializeListeners() {
    socket.removeAllListeners();
    socket.on("NEW_NOTIFICATION", data => {
      let { notification, course, room } = data;
      let type = notification.notificationType;
      let resource = notification.resourceType;

      this.props.addNotification(notification);

      if (type === "newMember") {
        // add new member to room
        let actionName = `add${capitalize(resource)}Member`;
        let { _id, username } = notification.fromUser;
        this.props[actionName](notification.resourceId, {
          user: { _id, username },
          role: "participant"
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
    });

    socket.on("disconnect", () => {
      this.props.updateUser({ connected: false });
    });

    socket.on("reconnect", attemptNumber => {
      let userId = this.props.user._id;
      let socketId = socket.id;
      socket.emit("SYNC_SOCKET", { socketId, userId }, (res, err) => {
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

  componentWillUnmount() {
    socket.removeAllListeners();
  }

  render() {
    return this.props.children;
  }
}

const mapStateToProps = state => {
  return { user: state.user };
};

export default connect(
  mapStateToProps,
  {
    addNotification,
    addUserCourses,
    getUser,
    addUserRooms,
    gotCourses,
    gotRooms,
    addCourseRooms,
    addRoomMember,
    addCourseMember,
    updateUser
  }
)(SocketProvider);
