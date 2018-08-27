import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions'
import { Link } from 'react-router-dom';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
const confirmation = props => (
  <div>
    <ContentBox title={props.success ? props.successMessage : props.errorMessage}>
      <Link onClick={props.clear} to='/profile/courses'>Go to your dashboard</Link>
    </ContentBox>
  </div>
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
