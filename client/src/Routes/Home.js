import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { HomeNav, Navbar } from '../Components';
import {
  Homepage,
  Login,
  Signup,
  Community,
  Logout,
  TempWorkspace,
  Profile,
} from '../Containers';
import { Confirmation, About } from '../Layout';
import classes from './main.css';
import Aux from '../Components/HOC/Auxil';

class Home extends PureComponent {
  state = {
    scrollPosition: 0,
  };

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll); // @TODO while it would be less dry we should move this out of here and into homeNave and Homepage...
    // having this at the top level causes a complete re-render of the app on every scroll...actually we might just need it on the homeNav
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = event => {
    this.setState({
      scrollPosition:
        event.srcElement.scrollingElement.scrollTop / window.innerHeight,
    });
  };

  render() {
    const { location, user } = this.props;
    const { scrollPosition } = this.state;
    return (
      <Aux>
        {location.pathname.indexOf('community') > -1 ||
        location.pathname.indexOf('profile') > -1 ? (
          <Navbar fixed user={user} />
        ) : (
          <HomeNav
            // scrollPosition={this.state.scrollPosition}
            page={location.pathname}
            user={user}
          />
        )}
        <div
          className={classes.Container}
          style={{
            marginTop: location.pathname.indexOf('explore') > -1 ? 0 : 50,
          }}
        >
          <Switch>
            <Route
              exact
              path="/"
              render={() => (
                <Homepage scrollPosition={scrollPosition} {...this.props} />
              )}
            />
            {/* <Route path="/community/:resource/:action" component={Community} /> */}
            <Route path="/about" component={About} />
            <Route path="/community/:resource" component={Community} />
            <Route exact path="/logout" component={Logout} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/explore/:id" component={TempWorkspace} />
            <Route path="/confirmation" component={Confirmation} />
            <Route path="/profile" component={Profile} />
          </Switch>
        </div>
        {/* <Route path='/about' component={About} />
        <Route path='/tutorials' component={Tutorials} /> */}
      </Aux>
    );
  }
}

export default connect(
  state => ({ user: state.user }),
  null
)(Home);
