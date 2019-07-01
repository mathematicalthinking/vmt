import { connect } from 'react-redux';
import { login, clearError } from '../store/actions';
import { LoginLayout } from '../Layout';

const mapStateToProps = store => {
  return {
    loggedIn: store.user.loggedIn,
    errorMessage: store.loading.errorMessage,
    loading: store.loading.loading,
  };
};

export default connect(
  mapStateToProps,
  { login, clearError }
)(LoginLayout);
