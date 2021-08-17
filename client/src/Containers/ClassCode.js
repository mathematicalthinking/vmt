import { connect } from 'react-redux';
import { ClassCode } from '../Layout';
import { signup, clearError, codeLogin, login } from '../store/actions';

const mapStateToProps = (store) => {
  return {
    loggedIn: store.user.loggedIn,
    errorMessage: store.loading.errorMessage,
    loading: store.loading.loading,
  };
};

export default connect(
  mapStateToProps,
  { signup, clearError, codeLogin, login }
)(ClassCode);
