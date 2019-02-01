import React from "react";
import { connect } from "react-redux";
import * as actions from "../../store/actions";
import { Link } from "react-router-dom";
import { Background, Aux, Button } from "../../Components";
import classes from "./confirmation.css";
const confirmation = props => (
  <Aux>
    <Background />
    <div className={classes.Main}>
      <div>{props.success ? props.successMessage : props.errorMessage}</div>
      <Link onClick={props.clear} to="/myVMT/courses">
        <Button theme={"Big"} m={20}>
          Go to your dashboard
        </Button>
      </Link>
    </div>
  </Aux>
);

const mapStateToProps = state => ({
  success: state.loading.accessSuccess,
  successMessage: state.loading.successMessage,
  errorMessage: state.loading.errorMessage
});

const mapDispatchToProps = dispatch => ({
  clear: () => dispatch(actions.clearLoadingInfo())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(confirmation);
