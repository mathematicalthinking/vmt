import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import ControlWarningModal from './ControlWarningModal';

const CodePyretOrg = (props) => {
  const [showControlWarning, setShowControlWarning] = useState(false);
  useEffect(() => {
    props.setFirstTabLoaded();
  }, []);

  function _hasControl() {
    return props.inControl === 'ME';
  }
  function _checkForControl(event) {
    if (!_hasControl()) {
      event.preventDefault();
      setShowControlWarning(true);
    }
  }

  const style = { width: '100%', height: '100%' };
  const { inControl, user } = props;
  return (
    <Fragment>
      <ControlWarningModal
        showControlWarning={showControlWarning}
        toggleControlWarning={() => {
          setShowControlWarning(false);
        }}
        takeControl={() => {
          props.toggleControl();
          setShowControlWarning(false);
        }}
        inControl={inControl}
        cancel={() => {
          setShowControlWarning(false);
        }}
        inAdminMode={user.inAdminMode}
      />

      <div
        style={{ height: '100%' }}
        id="container"
        onClickCapture={_checkForControl}
      >
        <iframe
          style={style}
          title="pyret"
          src="https://code.pyret.org/editor"
        />
      </div>
    </Fragment>
  );
};

CodePyretOrg.propTypes = {
  user: PropTypes.shape({}).isRequired,
  toggleControl: PropTypes.func.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  inControl: PropTypes.string.isRequired,
};

export default CodePyretOrg;
