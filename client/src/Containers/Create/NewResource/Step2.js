import React from 'react';
import { RadioBtn } from '../../../Components/';
import classes from '../create.css';
const Step2 = React.memo((props) => {
  return (
    <div className={classes.Row}>
      <RadioBtn checked={!props.copying} name='new'>Create a New {props.displayResource}</RadioBtn>
      <RadioBtn checked={props.copying} name='copy' check={props.check}>Create From an Existing Activity</RadioBtn>
    </div>
  )
})

export default Step2;