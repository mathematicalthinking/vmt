import React from 'react';
import { RadioBtn } from '../../../Components/';
import classes from '../create.css';
const Step2 = React.memo((props) => {
  return (
    <div className={classes.Buttons}>
      <RadioBtn click={() => {props.nextStep('new')}} m={5}>Create a New {props.displayResource}</RadioBtn>
      <RadioBtn click={() => {props.nextStep('')}} m={5}>Create From an Existing Activity</RadioBtn>
    </div>
  )
})

export default Step2;