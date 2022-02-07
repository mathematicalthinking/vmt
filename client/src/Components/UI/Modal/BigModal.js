// PROPS:
// show: Boolean
// closeModal: function()
// children: jsx
// message: String (if no children display loading icon with custom message)
//

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import gif from './Ripple.gif';
import Backdrop from '../Backdrop/Backdrop';
import classes from './bigModal.css';

const BigModal = ({ show, closeModal, message, children, height, testId }) => (
  <Fragment>
    <Backdrop show={show} />
    <div
      className={classes.Modal}
      data-testid={testId}
      style={{
        transform: show ? 'translateY(-50%)' : 'translateY(-150vh)',
        opacity: show ? '1' : '0',
        height: height || 'auto',
        // width: height || 'auto',
      }}
    >
      {children ? (
        <Fragment>
          {closeModal && (
            <div
              data-testid="close-modal"
              className={classes.Close}
              onClick={closeModal}
              onKeyPress={closeModal}
              tabIndex="-2"
              role="button"
            >
              <i className="fas fa-times" />
            </div>
          )}
          {children}
        </Fragment>
      ) : (
        <Fragment>
          <div className="loader">
            <img src={gif} alt="loading" />
          </div>
          <div className={classes.Message}>{message}</div>
        </Fragment>
      )}
    </div>
  </Fragment>
);

BigModal.propTypes = {
  show: PropTypes.bool.isRequired,
  closeModal: PropTypes.func,
  message: PropTypes.string,
  children: PropTypes.node.isRequired,
  height: PropTypes.string,
  testId: PropTypes.string,
};

BigModal.defaultProps = {
  closeModal: null,
  message: null,
  height: null,
  testId: null,
};

export default BigModal;
