import React, { Component } from 'react';
import Navbar from '../Components/Navigation/Navbar';
import Login from '../Containers/Login/Login';
import Room from '../Containers/Room/Room';
import Course from '../Containers/Course/Course';
import PublicList from '../Containers/PublicList/PublicList';
import NewUser from '../Containers/Create/NewUser/NewUser';
import Dashboard from '../Containers/Dashboard/Dashboard';
import Assignments from '../Containers/Assignments/Assignments';
import Avatar from '../Components/UI/Avatar/Avatar';
import PrivateRoute from '../Components/HOC/PrivateRoute';
import Workspace from '../Containers/Room/Workspace/Room';
import classes from './main.css';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';

class Main extends Component {
  render() {
    return (
      <Router>
        <main className={classes.Main}>
          {/* <div className={classes.Particles} id='particles-js'></div> */}
          <div className={classes.Banner}>
            <h2>Virtual Math Teams</h2>
            {this.props.loggedIn ? <Avatar username={this.props.username} /> : null}
          </div>
          <Navbar />
          <section className={classes.Section}>
            <Switch>
              <Route exact path='/' component={Login}/>
              <Route path='/users/new' authed={this.props.loggedIn} component={NewUser}/>
              <Route exact path='/publicList/:resource' component={PublicList}/>
              <Route exact path='/publicResource/room/:room_id/:resource' component={Room}/>
              <Route exact path='/publicResource/course/:course_id/:resource' component={Course} />
              <PrivateRoute exact path='/dashboard/:resource' authed={this.props.loggedIn} component={Dashboard}/>
              <PrivateRoute exact path = '/dashboard/course/:course_id/:resource' authed={this.props.loggedIn} component={Course}/>
              <PrivateRoute exact path = '/dashboard/room/:room_id/:resource' authed={this.props.loggedIn} component={Room} />
              <PrivateRoute expact path = '/workspace/:room_id' authed={this.props.loggedIn} component={Workspace} />
                {/* <Route exact path='/dashboard/course/:course_id/room/:room_id/:resource' authed={this.props.loggedIn} component={Room}/> */}
              <PrivateRoute path='/assign' authed={this.props.loggedIn} component={Assignments}/>
              <Route exact path='/logout' component={Login}/>
              <Route path="*" render={() => {
                return (<div>Error</div>)
                // ^ @TODO 404 page
              }}/>
            </Switch>
          </section>
        </main>
      </Router>
    )
  }
};

// Provide login status to all private routes
const mapStateToProps = store => {
  return {
    username: store.userReducer.username,
    loggedIn: store.userReducer.loggedIn,
  };
}

export default connect(mapStateToProps, null)(Main);
