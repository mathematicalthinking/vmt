import React from 'react';
import PropTypes from 'prop-types';
import { TextInput } from '../../../Components';
import classes from '../create.css';

// @TODO CHANGE TO CLASS COMPONENTS SO WE CAN USE AREF TO SET THE FOCUS
const Step1 = React.memo((props) => {
  const {
    displayResource,
    changeHandler,
    description,
    resource,
    name,
    organization,
    school,
    district,
  } = props;
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
      {resource === 'courses' ? (
        <div className={classes.FormSection}>
          <div className={classes.OptionalHeader}>Optional Class Data</div>
          <TextInput
            light
            name="organization"
            label="Organization"
            value={organization}
            change={changeHandler}
            width="100%"
            data-testid={`${resource}-organization`}
          />
          <TextInput
            light
            name="district"
            label="District"
            value={district}
            change={changeHandler}
            width="100%"
            data-testid={`${resource}-district`}
          />
          <TextInput
            light
            name="school"
            label="School"
            value={school}
            change={changeHandler}
            width="100%"
            data-testid={`${resource}-school`}
          />
        </div>
      ) : null}
    </div>
  );
});

Step1.propTypes = {
  displayResource: PropTypes.string.isRequired,
  changeHandler: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  district: PropTypes.string,
  school: PropTypes.string,
  organization: PropTypes.string,
};

Step1.defaultProps = {
  district: '',
  school: '',
  organization: '',
};

export default Step1;
