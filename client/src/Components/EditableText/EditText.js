import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classes from './editText.css';

const EditText = ({ editing, inputType, change, children, options, name }) => {
  let input;
  let plainText;
  if (editing) {
    switch (inputType) {
      case 'title':
        input = (
          <input
            data-testid={`edit-${name}`}
            className={[classes.Common, classes.Title].join(' ')}
            type="text"
            value={children || ''}
            onChange={change}
            name={name}
          />
        );
        break;
      case 'radio':
        input = (
          <div className={classes.Radios}>
            {/* THIS COULD BE MADE DYNAMIC BY STICKING IN AN OPTIONS.FOREACH LOOP */}
            <span className={classes.RadioItem}>
              <input
                data-testid={`edit-${options[0]}`}
                type="radio"
                name={name}
                checked={children === options[0]}
                onChange={event => {
                  change(event, options[0]);
                }}
              />{' '}
              {options[0]}
            </span>
            <span className={classes.RadioItem}>
              <input
                data-testid={`edit-${options[1]}`}
                type="radio"
                name={name}
                checked={children === options[1]}
                onChange={event => {
                  change(event, options[1]);
                }}
              />{' '}
              {options[1]}
            </span>
          </div>
        );
        break;
      case 'date':
        input = (
          <input
            data-testid="edit-dueDate"
            className={[classes.Common, classes.Date].join(' ')}
            name={name}
            type="date"
            value={children || ''}
            onChange={change}
          />
        );
        break;
      case 'text-area':
        input = (
          <textarea
            data-testid={`edit-${name}`}
            className={classes.TextArea}
            onChange={change}
            name={name}
            value={children || ''}
          />
        );
        break;
      default:
        input = (
          <input
            data-testid={`edit-${name}`}
            className={[classes.Common, classes.Text].join(' ')}
            name={name}
            type="text"
            value={children || ''}
            onChange={change}
          />
        );
    }
  } else {
    if (inputType === 'date') {
      if (children) {
        children = moment(children).format('L');
      } else {
        children = 'Not Set';
      }
    }
    plainText = (
      <div data-testid={name} className={classes.NormalText}>
        {children}
      </div>
    );
  }
  return editing ? input : plainText;
};

EditText.propTypes = {
  editing: PropTypes.bool.isRequired,
  inputType: PropTypes.string.isRequired,
  change: PropTypes.func.isRequired,
  children: PropTypes.node,
  options: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string.isRequired,
};

EditText.defaultProps = {
  options: null,
  children: null,
};
export default EditText;
