import React, { Component } from 'react';
import Navbar from '../Components/Navigation/Navbar';
import { MyVMT, Course, Activity, Room } from '../Containers';
// import PublicList from '../Containers/PublicList/PublicList';
// import Dashboard from '../Layout/Dashboard/Dashboard';
// import Activities from '../Containers/Activities/Activities';
// import Avatar from '../Components/UI/Avatar/Avatar';
import PrivateRoute from '../Components/HOC/PrivateRoute';
// import Workspace from '../Containers/Workspace/Workspace';
// import Replayer from '../Containers/Replayer/Replayer';
import { Confirmation, FacilitatorInstructions }from '../Layout';
import Aux from '../Components/HOC/Auxil';
// import classes from './main.css';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';



class MyVmt extends Component {
  render() {
    const { path } = this.props.match
    console.log(path)
    return (
      // <main className={classes.Main}>
      //   {/* <div className={classes.Particles} id='particles-js'></div> */}
      //   <div className={classes.Banner}>
      //     <h2>Virtual Math Teams</h2>
      //     {this.props.loggedIn ? <Avatar username={this.props.username} /> : null}
      //   </div>
      <Aux>
        <Navbar />
          <Switch>
            <PrivateRoute exact path={`${path}/facilitator`} authed={this.props.loggedIn} component={FacilitatorInstructions} />
            <PrivateRoute exact path={`${path}/:resource`} authed={this.props.loggedIn} component={MyVMT}/>
            <PrivateRoute exact path = {`${path}/courses/:course_id/:resource`} authed={this.props.loggedIn} component={Course}/>
            <PrivateRoute exact path={`${path}/courses/:course_id/activities/:activity_id/:resource`} authed={this.props.loggedIn} component={Activity} />
            <PrivateRoute exact path = {`${path}/rooms/:room_id/:resource`} authed={this.props.loggedIn} component={Room}/>
            <PrivateRoute exact path={`${path}/activities/:activity_id/:resource`} authed={this.props.loggedIn} component={Activity} />
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
            <Route path='/confirmation' component={Confirmation} />}
            {/* <Route exact path='/logout' component={Login}/> */}
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
  username: store.user.username,
  loggedIn: store.user.loggedIn,
})

export default connect(mapStateToProps, null)(MyVmt)
