import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const CodePyretOrg = (props) => {
  const { setFirstTabLoaded } = props;
  useEffect(() => {
    setFirstTabLoaded();
  }, []);
  console.log('Pyret is disabled. props: ');
  return <div>Pyret Disabled</div>;
};

CodePyretOrg.propTypes = {
  // room: PropTypes.shape({}).isRequired,
  // tab: PropTypes.shape({}).isRequired,
  // user: PropTypes.shape({}).isRequired,
  // myColor: PropTypes.string.isRequired,
  // resetControlTimer: PropTypes.func.isRequired,
  // updatedRoom: PropTypes.func.isRequired,
  // toggleControl: PropTypes.func.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  // inControl: PropTypes.string.isRequired,
  // addNtfToTabs: PropTypes.func.isRequired,
  // addToLog: PropTypes.func.isRequired,
};

export default CodePyretOrg;
