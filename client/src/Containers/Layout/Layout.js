import React, { Component } from 'react';
import classes from './Layout.css';
import Navbar from '../../Components/Navigation/Navbar';
import Login from '../Login/Login';
import Rooms from '../Rooms/Rooms';
import PrivateRoute from '../../Components/HOC/PrivateRoute';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
class Layout extends Component {

  render() {
    return (
      <Router>
        <div className={classes.Layout}>
          <div>Welcome to Virtual Math Teams</div>
          <Navbar />
          <Switch>
            <Route exact path='/' component={Login}/>
            <PrivateRoute path='/rooms' authed={this.props.loggedIn} component={Rooms}/>
            <PrivateRoute path='/rooms/new' authed={this.props.loggedIn} component={Rooms}/>
            <PrivateRoute path='/rooms/:id' authed={this.props.loggedIn} component={Rooms}/>
            <PrivateRoute path='/users/new' authed={this.props.loggedIn} component={Rooms}/>
            <PrivateRoute path='/courses' authed={this.props.loggedIn} component={Rooms}/>
            <PrivateRoute path='/courses/new' authed={this.props.loggedIn} component={Rooms}/>
            <PrivateRoute path='/assign' authed={this.props.loggedIn} component={Rooms}/>
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
const mapStateToProps = (store) => {
  console.log(store);
  return {loggedIn: store.authReducer.loggedIn};
}

export default connect(mapStateToProps, null)(Layout);
