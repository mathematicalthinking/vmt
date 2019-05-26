import { connect } from 'react-redux';
import { Signup } from '../Layout';
import { signup, clearError } from '../store/actions';

const mapStateToProps = store => {
  return {
    loggedIn: store.user.loggedIn,
    errorMessage: store.loading.errorMessage,
  };
};

export default connect(
  mapStateToProps,
  { signup, clearError }
)(Signup);
