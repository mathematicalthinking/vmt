import React, { Component } from 'react';
import Navbar from '../Components/Navigation/Navbar';
import Login from '../Containers/Login/Login';
import Rooms from '../Containers/Rooms/Rooms';
import Room from '../Containers/Room/Room';
import Courses from '../Containers/Courses/Courses';
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
          <h2 className={classes.Banner}>Welcome To Virtual Math Teams</h2>
          <Navbar />
          <section className={classes.Section}>
            <Switch>
              <Route exact path='/' component={Login}/>
              <Route path='/users/new' authed={this.props.loggedIn} component={NewUser}/>
              <PrivateRoute exact path='/rooms' authed={this.props.loggedIn} component={Rooms}/>
              <PrivateRoute exact path='/rooms/new' authed={this.props.loggedIn} component={Rooms}/>
              <PrivateRoute path='/room/:id' authed={this.props.loggedIn} component={Room}/>
              <PrivateRoute exact path='/courses' authed={this.props.loggedIn} component={Courses}/>
              <PrivateRoute exact path='/courses/new' authed={this.props.loggedIn} component={Courses}/>
              <PrivateRoute path='/assign' authed={this.props.loggedIn} component={Assignments}/>
              <Route path='/ggb' render={() => {
                console.log('getting ggb route')
              }}/>
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
  return {loggedIn: store.userReducer.loggedIn};
}

export default connect(mapStateToProps, null)(Layout);
