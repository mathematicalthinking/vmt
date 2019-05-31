import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../../../Components';

class FromActivity extends Component {
  render() {
    const { show } = this.props;
    return <Modal show={show} />;
  }
}

FromActivity.propTypes = {
  show: PropTypes.func.isRequired,
};
export default FromActivity;
