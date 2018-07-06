import React, { Component } from 'react';
import Navbar from '../Components/Navigation/Navbar';
import Login from '../Containers/Login/Login';
import Rooms from '../Containers/Rooms/Rooms';
import Room from '../Containers/Room/Room';
import Courses from '../Containers/Courses/Courses';
import NewUser from '../Containers/NewUser/NewUser';
import Assignments from '../Containers/Assignments/Assignments';
import PrivateRoute from '../Components/HOC/PrivateRoute';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
class Layout extends Component {

  render() {
    return (
      <Router>
        <div style={{margin: 20}}>
          <h2>Welcome To Virtual Math Teams</h2>
          <Navbar />
          <Switch>
            <Route exact path='/' component={Login}/>
            <PrivateRoute exact path='/rooms' authed={this.props.loggedIn} component={Rooms}/>
            <PrivateRoute exact path='/rooms/new' authed={this.props.loggedIn} component={Rooms}/>
            <PrivateRoute path='/room/:id' authed={this.props.loggedIn} component={Room}/>
            <PrivateRoute path='/users/new' authed={this.props.loggedIn} component={NewUser}/>
            <PrivateRoute exact path='/courses' authed={this.props.loggedIn} component={Courses}/>
            <PrivateRoute exact path='/courses/new' authed={this.props.loggedIn} component={Courses}/>
            <PrivateRoute path='/assign' authed={this.props.loggedIn} component={Assignments}/>
            <Route path="*" render={() => {
              return (<div>Error</div>)
            }}/>
          </Switch>
        </div>
      </Router>
    )
  }
};

// Provide login status to all private routes
const mapStateToProps = store => {
  return {loggedIn: store.userReducer.loggedIn};
}

export default connect(mapStateToProps, null)(Layout);
