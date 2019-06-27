import { connect } from 'react-redux';
import { Signup } from '../Layout';
import { signup, clearError } from '../store/actions';

const mapStateToProps = store => {
  return {
    loggedIn: store.user.loggedIn,
    errorMessage: store.loading.errorMessage,
    loading: store.loading.loading,
  };
};

export default connect(
  mapStateToProps,
  { signup, clearError }
)(Signup);
