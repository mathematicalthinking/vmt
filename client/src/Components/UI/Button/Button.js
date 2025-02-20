import React from 'react';
import PropTypes from 'prop-types';
import classes from './button.css';

const Button = (props) => {
  const { theme, disabled, m, click, type, children, tabIndex, id, p } = props;
  // let styles = [classes.Button]
  let styles = classes[theme];
  if (disabled) {
    styles = [classes[theme], classes.Disabled].join(' ');
  }
  return (
    // eslint-disable-next-line react/button-has-type
    <button
      className={styles}
      style={{ margin: m, padding: p }}
      onClick={click}
      id={id}
      // eslint-disable-next-line react/button-has-type
      type={type}
      tabIndex={tabIndex}
      // eslint-disable-next-line react/destructuring-assignment
      data-testid={props['data-testid']}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  'data-testid': PropTypes.string,
  theme: PropTypes.string,
  disabled: PropTypes.bool,
  m: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  p: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  click: PropTypes.func.isRequired,
  tabIndex: PropTypes.number,
  id: PropTypes.string,
  type: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Button.defaultProps = {
  id: null,
  tabIndex: 0,
  m: 0,
  p: undefined,
  disabled: false,
  type: 'button',
  'data-testid': null,
  theme: 'Small',
};

export default Button;
