import React from 'react';
import PropTypes from 'prop-types';
import classes from './notification.css';

const Notification = ({ count, size, dataTestId }) => {
  return (
    <span
      data-testid={dataTestId || 'ntf'}
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
  count: PropTypes.number.isRequired,
  size: PropTypes.string.isRequired,
  dataTestId: PropTypes.string.isRequired,
};
export default Notification;
