import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { getUser } from '../../store/actions';
import SmallLoading from '../Loading/SmallLoading';
import { Button, Modal } from '../../Components';
import GoogleLogin from '../../Components/Form/Google/LoginButton';

class OauthReturn extends Component {
  state = { showModal: false };
  componentDidMount() {
    const {
      connectGetUser,
      presumptiveEmailAddress,
      selectedEmailAddress,
    } = this.props;
    if (
      presumptiveEmailAddress &&
      presumptiveEmailAddress !== selectedEmailAddress
    ) {
      // If the gmail acct that the user selected on the Google Oauth page
      // differs from the email address that was used for them during import,
      // ask the user what email they want to use.
      // If they want to use the acct that they selected, continue as normal,
      // else redirect back to the Google Oauth page.
      this.setState({ showModal: true });
    } else connectGetUser();
  }

  render() {
    const { loggedIn, errorMessage, loading } = this.props;
    const { showModal } = this.state;
    if (showModal) {
      return (
        <Modal show={showModal}>
          <div>
            The email address used to log in is different than the email
            addresss selected.
            <Button
              click={() => {
                connectGetUser();
                this.setState({ showModal: false });
              }}
            >
              Continue with log in email?
            </Button>
            Log in again <GoogleLogin />
          </div>
        </Modal>
      );
    }

    if (loggedIn) {
      return <Redirect to="/myVMT/rooms" />;
    }

    if (errorMessage) {
      return <Redirect to="/login" />;
    }

    return <Fragment>{loading ? <SmallLoading /> : null}</Fragment>;
  }
}

OauthReturn.propTypes = {
  loggedIn: PropTypes.bool,
  connectGetUser: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  loading: PropTypes.bool,
  presumptiveEmailAddress: PropTypes.string,
};

OauthReturn.defaultProps = {
  loggedIn: false,
  errorMessage: null,
  loading: false,
  presumptiveEmailAddress: '',
};
const mapStateToProps = (state) => {
  return {
    loggedIn: state.user.loggedIn,
    errorMessage: state.loading.errorMessage,
    loading: state.loading.loading,
    presumptiveEmailAddress: state.user.presumptiveEmailAddress,
    selectedEmailAddress: state.user.email,
  };
};

export default connect(
  mapStateToProps,
  {
    connectGetUser: getUser,
  }
)(OauthReturn);
