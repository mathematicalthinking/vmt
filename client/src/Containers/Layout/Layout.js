import React, { Component } from 'react';
import classes from './Layout.css';
import Navbar from '../../Components/Navigation/Navbar';
import Login from '../Login/Login';
import Rooms from '../Rooms/Rooms';
import PrivateRoute from '../../Components/HOC/PrivateRoute';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, Link, Redirect, withRouter } from 'react-router-dom';
class Layout extends Component {

  render() {
    return (
      <Router>
        <div className={classes.Layout}>
          <div>Welcome to Virtual Math Teams</div>
          <Navbar />
          <Switch>
            <Route exact path='/' component={Login}/>
            <PrivateRoute authed={this.props.loggedIn} path='/rooms' component={Rooms}/>
          </Switch>
        </div>
      </Router>
    )
  }
};

const mapStateToProps = (store) => {
  console.log(store);
  return {loggedIn: store.authReducer.loggedIn};
}

export default connect(mapStateToProps, null)(Layout);
