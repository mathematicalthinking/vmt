import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as actions from '../../store/actions';
import { Background, Aux, Button } from '../../Components';
import classes from './confirmation.css';

const Confirmation = props => {
  const { errorMessage, successMessage, success, connectClear } = props;
  return (
    <Aux>
      <Background />
      <div className={classes.Main}>
        <div>{success ? successMessage : errorMessage}</div>
        <Link onClick={connectClear} to="/myVMT/courses">
          <Button theme="Big" m={20} click={connectClear}>
            Go to your dashboard
          </Button>
        </Link>
      </div>
    </Aux>
  );
};

Confirmation.propTypes = {
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
  success: PropTypes.bool,
  connectClear: PropTypes.func.isRequired,
};

Confirmation.defaultProps = {
  errorMessage: null,
  successMessage: null,
  success: false,
};

const mapStateToProps = state => ({
  success: state.loading.accessSuccess || state.loading.forgotPasswordSuccess,
  successMessage: state.loading.successMessage,
  errorMessage: state.loading.errorMessage,
});

const mapDispatchToProps = dispatch => ({
  connectClear: () => dispatch(actions.clearLoadingInfo()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Confirmation);
