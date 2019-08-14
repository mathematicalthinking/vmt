import { connect } from 'react-redux';
import { forgotPassword, clearError } from '../store/actions';
import { ForgotPassword } from '../Layout';

const mapStateToProps = (store) => {
  return {
    loggedIn: store.user.loggedIn,
    errorMessage: store.loading.errorMessage,
    loading: store.loading.loading,
    successMessage: store.loading.successMessage,
  };
};

export default connect(
  mapStateToProps,
  { forgotPassword, clearError }
)(ForgotPassword);
