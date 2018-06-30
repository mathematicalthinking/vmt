import React, { Component } from 'react';
import Navbar from '../Components/Navigation/Navbar';
import Login from '../Containers/Login/Login';
import Rooms from '../Containers/Rooms/Rooms';
import Room from '../Containers/Room/Room';
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
