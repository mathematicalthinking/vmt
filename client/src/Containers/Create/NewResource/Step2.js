import React from 'react';
import { Button } from '../../../Components/';
import classes from '../create.css';
const Step2 = React.memo((props) => {
  return (
    <div className={classes.Buttons}>
      <Button click={() => {props.nextStep('new')}} m={5}>Create a New {props.resource}</Button>
      <Button click={() => {props.nextStep('')}} m={5}>Create From an Existing Activity</Button>
      <Button theme='Small-cancel'>Cancel</Button>
    </div>
  )
})

export default Step2;