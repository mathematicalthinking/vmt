import React from 'react';
import PropTypes from 'prop-types';
import classes from './notification.css';

const Notification = ({
  count = null,
  size = null,
  'data-testid': dataTestId = 'ntf-icon',
}) => {
  return (
    <span
      data-testid={dataTestId}
      className={['fa-stack fa-1x', classes.Container].join(' ')}
    >
      <i
        className={['fas fa-bell fa-stack-2x', classes.Bell].join(' ')}
        style={{ fontSize: size === 'small' ? 20 : 32 }}
      />
      <span className={['fa fa-stack-1x', classes.Count].join(' ')}>
        {count}
      </span>
    </span>
  );
};

Notification.propTypes = {
  count: PropTypes.number,
  size: PropTypes.string,
  'data-testid': PropTypes.string,
};

export default Notification;
