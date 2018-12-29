import React, { Component } from 'react';
import Navbar from '../Components/Navigation/Navbar';
import {
  MyVMT,
  Course,
  Activity,
  Room,
  Workspace,
  Replayer,
  ActivityWorkspace
} from '../Containers';
import PrivateRoute from '../Components/HOC/PrivateRoute';
import { Confirmation, FacilitatorInstructions }from '../Layout';
import Aux from '../Components/HOC/Auxil';
import { connect } from 'react-redux';
import { Route, Switch, } from 'react-router-dom';
import { addNotification, addUserCourses, addUserRooms, gotCourses, gotRooms, addCourseRooms, addRoomMember, addCourseMember } from '../store/actions';
import socket from '../utils/sockets';
import { normalize } from '../store/utils/normalize';
import { capitalize } from 'lodash'

class MyVmt extends Component {

  componentDidMount() {

    let { socketId, _id } = this.props.user;

      socket.emit('CHECK_SOCKET', {socketId, _id }, (res, err) => {
        if (err) {
          //something went wrong updatnig user socket
          // console.log('err updating user socketId', err);
          // HOW SHOULD WE HANDLE THIS @TODO
        }
        // console.log('checked socket', res);
      })


    socket.on('NEW_NOTIFICATION', data => {
      let { notification, course, room } = data;
      let type = notification.notificationType;
      let resource = notification.resourceType;

      this.props.addNotification(notification)

      if (type === 'newMember') {
        // add new member to room
        let actionName = `add${capitalize(resource)}Member`;
        this.props[actionName](notification.resourceId, notification.fromUser);
      }
      if (course) {
        let normalizedCourse = normalize([course])
        this.props.gotCourses(normalizedCourse);

        this.props.addUserCourses([course._id])
      }

      if (room) {
        let normalizedRoom = normalize([data.room])

        this.props.gotRooms(normalizedRoom, true)
        this.props.addUserRooms([data.room])
        if (data.room.course) {
          this.props.addCourseRooms(data.room.course, [data.room._id])

        }
      }
    })
  }

  componentWillUnmount() {
    socket.removeAllListeners()
  }

  render() {
    let { path } = this.props.match;
    return (
      <Aux>
        <Navbar/>
          <Switch>
            <PrivateRoute exact path={`${path}/facilitator`} authed={this.props.loggedIn} component={FacilitatorInstructions} />
            <PrivateRoute exact path={`${path}/:resource`} authed={this.props.loggedIn} component={MyVMT}/>
            <PrivateRoute exact path = {`${path}/courses/:course_id/:resource`} authed={this.props.loggedIn} redirectPath='/signup' component={Course}/>
            <PrivateRoute exact path={`${path}/courses/:course_id/activities/:activity_id/:resource`} authed={this.props.loggedIn} component={Activity} />
            <PrivateRoute exact path = {`${path}/courses/:course_id/rooms/:room_id/:resource`} redirectPath="/signup" authed={this.props.loggedIn} component={Room}/>
            <PrivateRoute exact path = {`${path}/rooms/:room_id/:resource`} redirectPath='/signup' authed={this.props.loggedIn} component={Room}/>
            <PrivateRoute exact path={`${path}/activities/:activity_id/:resource`} authed={this.props.loggedIn} component={Activity} />
            <PrivateRoute exact path={`${path}/workspace/:room_id/replayer`} authed={this.props.loggedIn} component={Replayer} />
            <PrivateRoute exact path={`${path}/workspace/:activity_id/activity`} authed={this.props.loggedIn} component={ActivityWorkspace} />
            <PrivateRoute exact path={`${path}/workspace/:room_id`} authed={this.props.loggedIn} component={Workspace} />

            {/* <Route exact path='/publicList/:resource' component={PublicList}/>
            <Route exact path='/publicResource/room/:room_id/:resource' component={Room}/>
            <Route exact path='/publicResource/course/:course_id/:resource' component={Course} />
            <PrivateRoute exact path='/profile/activities/:activity_id/:resource' authed={this.props.loggedIn} component={Activity} />
            <PrivateRoute exact path = '/profile/rooms/:room_id/:resource' authed={this.props.loggedIn} component={Room} />
            <PrivateRoute exact path = '/profile/course/:course_id/room/:room_id/:resource' authed={this.props.loggedIn} component={Room} />
            <PrivateRoute expact path = '/workspace/:room_id/replayer' authed={this.props.loggedIn} component={Replayer} />
            <PrivateRoute expact path = '/workspace/:room_id' authed={this.props.loggedIn} component={Workspace} />
            <Route exact path='/dashboard/course/:course_id/room/:room_id/:resource' authed={this.props.loggedIn} component={Room}/>
            {/* <PrivateRoute path='/assign' authed={this.props.loggedIn} component={Activities}/> */}
            <Route exact path='/confirmation' component={Confirmation} />}
            <Route path="*" render={() => {
              return (<div>Error</div>)
              // ^ @TODO 404 page
            }}/>
          </Switch>
      </Aux>
    )
  }
};
// Provide login status to all private routes
const mapStateToProps = store => ({
  loggedIn: store.user.loggedIn,
  user: store.user
})

export default connect(mapStateToProps, {addNotification, addUserCourses, addUserRooms, gotCourses, gotRooms, addCourseRooms, addRoomMember, addCourseMember})(MyVmt)
