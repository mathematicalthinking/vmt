import React from 'react';
import PropTypes from 'prop-types';
import classes from './button.css';

const Button = props => {
  const { theme, disabled, m, click, type, children } = props;
  // let styles = [classes.Button]
  let styles = classes[theme];
  if (!theme) {
    styles = classes.Small;
  }
  if (disabled) {
    styles = classes.Disabled;
  }

  return (
    // eslint-disable-next-line react/button-has-type
    <button
      className={styles}
      style={{ margin: m }}
      onClick={click}
      type={type}
      // eslint-disable-next-line react/destructuring-assignment
      data-testid={props['data-testid']}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  'data-testid': PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  m: PropTypes.number,
  click: PropTypes.func.isRequired,
  type: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
};

Button.defaultProps = {
  m: 0,
};

export default Button;
