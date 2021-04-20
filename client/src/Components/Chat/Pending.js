import React from 'react';
import PropTypes from 'prop-types';
import Classes from './pending.css';

/**
 * A notification to show who is currently typing a message
 */

function Pending({ pendingUsers }) {
  const nameGen = (username) => {
    let shortName = username;
    const maxLen = 12;
    if (shortName.includes('@'))
      shortName = shortName.substring(0, shortName.lastIndexOf('@'));
    if (shortName.length > maxLen) shortName = shortName.substring(0, maxLen);
    return shortName;
  };

  if (Object.keys(pendingUsers).length === 0) return null;
  let statusMessage = '';
  if (Object.keys(pendingUsers).length === 1)
    statusMessage = ` ${nameGen(Object.keys(pendingUsers).join(''))} is typing`;
  if (Object.keys(pendingUsers).length > 1)
    statusMessage = ` ${Object.keys(pendingUsers).length} users are typing`;
  return (
    <span className={Classes.Pending}>
      {statusMessage}
      <span className={Classes.dot1}>.</span>
      <span className={Classes.dot2}>.</span>
      <span className={Classes.dot3}>.</span>
    </span>
  );
}

Pending.propTypes = {
  pendingUsers: PropTypes.shape({}),
};

Pending.defaultProps = {
  pendingUsers: {},
};

export default Pending;
