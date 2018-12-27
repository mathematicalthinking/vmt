import React from 'react';
import { RadioBtn, SelectionList, TextInput } from '../../../Components/';
import classes from '../create.css';
const Step2 = React.memo((props) => {
  let content;
  if (props.copying) {
    // display list
    content = <SelectionList list='activities' />
  } else content = <div>
    <TextInput
      light
      name={`name`}
      label={`${props.displayResource} Name`}
      change={props.changeHandler}
      width='100%'
    />
    <TextInput
      light
      name='description'
      label='Description'
      change={props.changeHandler}
      width='100%'
      data-testid={`${props.resource}-description`}
    />
  </div>

  return (
    <div>
      <div className={classes.Row}>
        <RadioBtn checked={!props.copying} name='new' check={props.check}>Create a New {props.displayResource}</RadioBtn>
        <RadioBtn checked={props.copying} name='copy' check={props.check}>Create From Existing Activities</RadioBtn>
      </div>
      <div className={classes.Content}>
        {content}
      </div>
    </div>
  )
})

export default Step2;