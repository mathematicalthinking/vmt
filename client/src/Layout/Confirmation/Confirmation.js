import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions';
import { Link } from 'react-router-dom';
import { Background, Aux, Button } from '../../Components';
import classes from './confirmation.css';
const confirmation = props => (
  <Aux>
    <Background />
    <div className={classes.Main}>
      <div>{props.success ? props.successMessage : props.errorMessage}</div>
      <Button theme={"Big"} m={20}><Link onClick={props.clear} to='/myVMT/courses'>Go to your dashboard</Link></Button>
    </div>
  </Aux>
);

const mapStateToProps = state => ({
  success: state.loading.accessSuccess,
  successMessage: state.loading.successMessage,
  errorMessage: state.loading.errorMessage,
})

const mapDispatchToProps = dispatch => ({
  clear: () => dispatch(actions.clear())
})

export default connect(mapStateToProps, mapDispatchToProps)(confirmation);
