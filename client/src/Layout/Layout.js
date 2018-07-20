import React, { Component } from 'react';
import Navbar from '../Components/Navigation/Navbar';
import Login from '../Containers/Login/Login';
import Rooms from '../Containers/Rooms/Rooms';
import Room from '../Containers/Room/Room';
import Courses from '../Containers/Courses/Courses';
import Course from '../Containers/Course/Course';
import NewUser from '../Containers/NewUser/NewUser';
import Assignments from '../Containers/Assignments/Assignments';
import PrivateRoute from '../Components/HOC/PrivateRoute';
import classes from './Layout.css';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
class Layout extends Component {

  render() {
    return (
      <Router>
        <main className={classes.Main}>
          <div className={classes.Banner}>
            <h2>Virtual Math Teams</h2>
            {this.props.loggedIn ?
              <div className={classes.UserInfo}>
                <i className={["fas fa-user", classes.Avatar].join(' ')}></i>
                {this.props.username}
              </div> : null}
          </div>
          <Navbar />
          <section className={classes.Section}>
            <Switch>
              {/* <Route exact path='/' component={Login}/> */}
              <Route path='/users/new' authed={this.props.loggedIn} component={NewUser}/>
              <PrivateRoute exact path='/rooms' authed={this.props.loggedIn} component={Rooms}/>
              <PrivateRoute exact path='/rooms/new' authed={this.props.loggedIn} component={Rooms}/>
              <PrivateRoute path='/room/:id' authed={this.props.loggedIn} component={Room}/>
              <PrivateRoute exact path='/courses' authed={this.props.loggedIn} component={Courses}/>
              <PrivateRoute exact path='/courses/new' authed={this.props.loggedIn} component={Courses}/>
              <Route exact path='/' authed={this.props.loggedIn} component={Course} />
              <PrivateRoute path='/assign' authed={this.props.loggedIn} component={Assignments}/>
              <Route exact path='/logout' component={Login}/>
              <Route path="*" render={() => {
                return (<div>Error</div>)
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

export default connect(mapStateToProps, null)(Layout);
