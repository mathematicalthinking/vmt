import React, { PureComponent } from 'react';
import { Route, Switch } from 'react-router-dom';
import { HomeNav, Navbar } from '../Components/';
import {
  Homepage,
  Login,
  Signup,
  Community,
  Logout,
  TempWorkspace,
} from '../Containers';
import { Confirmation, About } from '../Layout';
import classes from './main.css';
import Aux from '../Components/HOC/Auxil';
import { connect } from 'react-redux';
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
    return (
      <Aux>
        {this.props.location.pathname.indexOf('community') > -1 ? (
          <Navbar fixed user={this.props.user} />
        ) : (
          <HomeNav
            // scrollPosition={this.state.scrollPosition}
            page={this.props.location.pathname}
            user={this.props.user}
          />
        )}
        <div
          className={classes.Container}
          style={{
            marginTop:
              this.props.location.pathname.indexOf('explore') > -1 ? 0 : 50,
          }}
        >
          <Switch>
            <Route
              exact
              path="/"
              render={() => (
                <Homepage
                  scrollPosition={this.state.scrollPosition}
                  {...this.props}
                />
              )}
            />
            {/* <Route path="/community/:resource/:action" component={Community} /> */}
            <Route path="/about" component={About} />
            <Route path="/community/:resource" component={Community} />
            <Route exact path={`/logout`} component={Logout} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/explore/:id" component={TempWorkspace} />
            <Route path="/confirmation" component={Confirmation} />
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
