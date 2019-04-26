import React from 'react';
import classes from './editText.css';
import moment from 'moment';
const EditText = React.memo(
  ({ editing, inputType, change, children, options, name }) => {
    let input;
    let plainText;
    if (editing) {
      switch (inputType) {
        case 'title':
          return (input = (
            <input
              data-testid={`edit-${name}`}
              className={[classes.Common, classes.Title].join(' ')}
              type="text"
              value={children || ''}
              onChange={change}
              name={name}
            />
          ));
        case 'radio':
          return (input = (
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
          ));
        case 'date':
          return (input = (
            <input
              data-testid={`edit-dueDate`}
              className={[classes.Common, classes.Date].join(' ')}
              name={name}
              type="date"
              value={children || ''}
              onChange={change}
            />
          ));
        case 'text-area':
          return (input = (
            <textarea
              data-testid={`edit-${name}`}
              className={classes.TextArea}
              onChange={change}
              name={name}
              value={children || ''}
            />
          ));
        default:
          return (input = (
            <input
              data-testid={`edit-${name}`}
              className={[classes.Common, classes.Text].join(' ')}
              name={name}
              type="text"
              value={children || ''}
              onChange={change}
            />
          ));
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
  }
);

export default EditText;
