import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { HomeNav, Modal, Navbar } from '../Components';
import {
  Homepage,
  Login,
  Signup,
  Community,
  Logout,
  Profile,
  ForgotPassword,
  ResetPassword,
  ConfirmEmail,
  Unconfirmed,
} from '../Containers';
import { Confirmation, About } from '../Layout';
import classes from './main.css';
import Aux from '../Components/HOC/Auxil';
import OauthReturn from '../Components/HOC/OauthReturn';
import { updateUser } from '../store/actions/user';

class Home extends PureComponent {
  state = {
    scrollPosition: 0,
    errorMsgSeen: false,
  };

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll); // @TODO while it would be less dry we should move this out of here and into homeNave and Homepage...
    // having this at the top level causes a complete re-render of the app on every scroll...actually we might just need it on the homeNav
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = (event) => {
    this.setState({
      scrollPosition:
        event.srcElement.scrollingElement.scrollTop / window.innerHeight,
    });
  };

  toggleAdmin = () => {
    const { connectUpdateUser, user } = this.props;
    connectUpdateUser({ inAdminMode: !user.inAdminMode });
  };

  isMobile = () => {
    return window.matchMedia('only screen and (max-width: 760px)').matches;
  };

  closeModal = () => {
    this.setState({ errorMsgSeen: true });
  };

  render() {
    const { location, user } = this.props;
    const { scrollPosition, errorMsgSeen } = this.state;
    return (
      <Aux>
        {location.pathname.indexOf('community') > -1 ||
        location.pathname.indexOf('profile') > -1 ||
        location.pathname.indexOf('dashboard') > -1 ? (
          <Navbar fixed user={user} toggleAdmin={this.toggleAdmin} />
        ) : (
          <HomeNav
            isDark={scrollPosition > 0.45}
            page={location.pathname}
            user={user}
            toggleAdmin={this.toggleAdmin}
          />
        )}
        <Modal
          show={this.isMobile() && !errorMsgSeen}
          closeModal={this.closeModal}
          height={120}
        >
          {'Welcome to Virtual Math Teams! '}
          <br />
          {'This Math experience is best viewed on a computer screen'}
        </Modal>
        <div
          className={classes.Container}
          style={{
            marginTop: location.pathname.indexOf('explore') > -1 ? 0 : 50,
          }}
        >
          <Switch>
            <Route exact path="/" render={() => <Homepage {...this.props} />} />
            <Route path="/about" component={About} />
            <Route path="/community/:resource" component={Community} />
            <Route exact path="/logout" component={Logout} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />

            <Route path="/confirmation" component={Confirmation} />
            <Route path="/profile" component={Profile} />
            <Route path="/forgotPassword" component={ForgotPassword} />
            <Route path="/resetPassword/:token?" component={ResetPassword} />
            <Route path="/confirmEmail/:token?" component={ConfirmEmail} />
            <Route path="/unconfirmed" component={Unconfirmed} />
            <Route path="/oauth/return" component={OauthReturn} />
          </Switch>
        </div>
      </Aux>
    );
  }
}

export default connect(
  (state) => ({ user: state.user }),
  {
    connectUpdateUser: updateUser,
  }
)(Home);
