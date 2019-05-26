import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  requestAccess,
  grantAccess,
  clearError,
  joinWithCode,
  // populateRoom,
} from '../store/actions';
import PrivateAccessModal from '../Components/UI/Modal/PrivateAccess';
import PublicAccessModal from '../Components/UI/Modal/PublicAccess';

class Access extends Component {
  render() {
    const { privacySetting } = this.props;
    if (privacySetting === 'public') {
      return <PublicAccessModal {...this.props} />;
    }
    return <PrivateAccessModal {...this.props} />;
  }
}

Access.propTypes = {
  privacySetting: PropTypes.bool.isRequired,
};

const mapStateToProps = store => ({
  user: store.user,
  error: store.loading.errorMessage,
});

export default connect(
  mapStateToProps,
  { requestAccess, grantAccess, joinWithCode, clearError }
)(Access);
