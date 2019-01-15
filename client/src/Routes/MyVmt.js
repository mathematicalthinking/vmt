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
import { PrivateRoute, ErrorToast } from '../Components';
import { Confirmation, FacilitatorInstructions }from '../Layout';
// import Aux from '../Components/HOC/Auxil';
import { connect } from 'react-redux';
import { Route, Switch, } from 'react-router-dom';
import ErrorBoundary from '../ErrorBoundary';



class MyVmt extends Component {

  render() {
    let { path } = this.props.match;
    return (
      <ErrorBoundary dispatchFail={this.props.fail}>
        <Navbar user={this.props.user}/>
          <Switch>
            <PrivateRoute exact path={`${path}/facilitator`} authed={this.props.loggedIn} component={FacilitatorInstructions} />
            <PrivateRoute exact path={`${path}/:resource`} authed={this.props.loggedIn} component={MyVMT}/>
            <PrivateRoute exact path = {`${path}/courses/:course_id/:resource`} authed={this.props.loggedIn} redirectPath='/signup' component={Course}/>
            <PrivateRoute exact path={`${path}/courses/:course_id/activities/:activity_id/:resource`} authed={this.props.loggedIn} redirectPath='/signup' component={Activity} />
            <PrivateRoute exact path = {`${path}/courses/:course_id/rooms/:room_id/:resource`} redirectPath="/signup" authed={this.props.loggedIn} component={Room}/>
            <PrivateRoute exact path = {`${path}/rooms/:room_id/:resource`} redirectPath='/signup' authed={this.props.loggedIn} component={Room}/>
            <PrivateRoute exact path={`${path}/activities/:activity_id/:resource`} authed={this.props.loggedIn} redirectPath='/signup' component={Activity} />
            <PrivateRoute exact path={`${path}/workspace/:room_id/replayer`} authed={this.props.loggedIn} component={Replayer} />
            <PrivateRoute exact path={`${path}/workspace/:activity_id/activity`} authed={this.props.loggedIn} redirectPath='/signup' component={ActivityWorkspace} />
            <PrivateRoute exact path={`${path}/workspace/:room_id`} authed={this.props.loggedIn} component={Workspace} />
            <Route exact path='/confirmation' component={Confirmation} />}
            <Route path="*" render={() => {
              return (<div>Error</div>)
              // ^ @TODO 404 page
            }}/>
          </Switch>
          {this.props.globalErrorMessage ? <ErrorToast>{this.props.globalErrorMessage}</ErrorToast> : null}
      </ErrorBoundary>
    )
  }
};
// Provide login status to all private routes
const mapStateToProps = state => ({
  loggedIn: state.user.loggedIn,
  user: state.user,
  globalErrorMessage: state.loading.globalErrorMessage,
})

export default connect(mapStateToProps, null)(MyVmt)
