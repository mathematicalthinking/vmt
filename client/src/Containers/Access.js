import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  requestAccess,
  grantAccess,
  clearError,
  joinWithCode,
} from '../store/actions';
import PrivateAccessModal from '../Components/UI/Modal/PrivateAccess';
import PublicAccessModal from '../Components/UI/Modal/PublicAccess';

class Access extends Component {
  render() {
    if (this.props.privacySetting === 'public') {
      return <PublicAccessModal {...this.props} />;
    }
    return <PrivateAccessModal {...this.props} />;
  }
}

const mapStateToProps = (store, ownProps) => ({
  user: store.user,
  error: store.loading.errorMessage,
});

export default connect(
  mapStateToProps,
  { requestAccess, grantAccess, joinWithCode, clearError }
)(Access);
