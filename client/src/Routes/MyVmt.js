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



class MyVmt extends Component {

  render() {
    let { path } = this.props.match;
    return (
      <Aux>
        <Navbar user={this.props.user}/>
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
const mapStateToProps = state => ({
  loggedIn: state.user.loggedIn,
  user: state.user
})

export default connect(mapStateToProps, null)(MyVmt)
