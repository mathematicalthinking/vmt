/* eslint-disable prettier/prettier */
import React from 'react';
import PropTypes from 'prop-types';
import classes from './toggleGroup.css';

export default function ToggleGroup(props) {
  const { buttons, initialSelection, onChange } = props;
  const [selection, setSelection] = React.useState(
    initialSelection || buttons[0]
  );
  const groupName = Math.random().toString();

  const _onChange = (event) => {
    setSelection(event.target.value);
    onChange(event.target.value);
  };

  return (
    <div className={classes.ToggleGroup}>
      {buttons.map((buttonName) => {
        return (
          <div key={buttonName} className={classes.ToggleElement}>
            <input
              className={classes.ToggleButton}
              type="radio"
              value={buttonName}
              name={groupName}
              id={buttonName}
              onChange={_onChange}
              checked={selection === buttonName}
            />
            <label htmlFor={buttonName}>{buttonName}</label>
          </div>
        );
      })}
    </div>
  );
}

ToggleGroup.propTypes = {
  buttons: PropTypes.arrayOf(PropTypes.string).isRequired,
  initialSelection: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

ToggleGroup.defaultProps = {
  initialSelection: null,
};
