import React from 'react';
import PropTypes from 'prop-types';
import { TextInput } from '../../../Components';
import classes from '../create.css';

// @TODO CHANGE TO CLASS COMPONENTS SO WE CAN USE AREF TO SET THE FOCUS
const Step1 = React.memo((props) => {
  const { displayResource, changeHandler, description, resource, name } = props;
  return (
    <div className={classes.FormSection}>
      <TextInput
        light
        name="name"
        label={`${displayResource} name`}
        change={changeHandler}
        value={name}
        width="100%"
      />
      <TextInput
        light
        name="description"
        label="description"
        change={changeHandler}
        value={description}
        width="100%"
        data-testid={`${resource}-description`}
      />
    </div>
  );
});

Step1.propTypes = {
  displayResource: PropTypes.string.isRequired,
  changeHandler: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default Step1;
