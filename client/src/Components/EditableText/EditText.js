import React from 'react';
import classes from './editText.css';
const EditText = React.memo(({editing, inputType, change, children, options}) => {
  let input;
  if (editing) {
    switch (inputType) {
      case 'title':
        return input = <input className={[classes.Common, classes.Title].join(' ')} type='text' value={children} onChange={change}/>
      case 'radio':
        return input = <div className={classes.Radios}>
          <span><input type="radio" name="gender" checked={children === options[0]}  /> {options[0]} </span>
          <span><input type="radio" name="gender" checked={children === options[1]} /> {options[1]} </span>
        </div>
      case 'date':
        return input = <input className={[classes.Common, classes.Date].join(' ')} type='date' value={children} onChange={change}/>
      default:
        return input = <input className={[classes.Common, classes.Text].join(' ')} type='text' value={children}/>
    }
  }
  return (
    editing 
      ? input
      : <div className={classes.NormalText}>{children}</div>
  )
})

export default EditText;