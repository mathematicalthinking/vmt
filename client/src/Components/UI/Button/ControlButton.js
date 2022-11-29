import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

export default function ControlButton({ controlState, onClick, ...others }) {
  return (
    <Button disabled={controlState.disabled} click={onClick} {...others}>
      {controlState.text}
    </Button>
  );
}

ControlButton.propTypes = {
  controlState: PropTypes.shape({
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};
