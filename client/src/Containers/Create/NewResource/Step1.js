import React from "react";
import { TextInput } from "../../../Components/";
import classes from "../create.css";
//@TODO CHANGE TO CLASS COMPONENTS SO WE CAN USE AREF TO SET THE FOCUS
const Step1 = React.memo(props => {
  return (
    <div className={classes.FormSection}>
      <TextInput
        light
        name={`name`}
        label={`${props.displayResource} name`}
        change={props.changeHandler}
        value={props.name}
        width="100%"
      />
      <TextInput
        light
        name="description"
        label="description"
        change={props.changeHandler}
        value={props.description}
        width="100%"
        data-testid={`${props.resource}-description`}
      />
    </div>
  );
});

export default Step1;
