import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { TextInput } from 'Components';
import classes from '../create.css';

const Step1 = (props) => {
  const {
    displayResource,
    changeHandler,
    description,
    resource,
    name,
    organization,
    school,
    district,
    gradeSelectHandler,
    gradeSelectOptions,
    gradeSelectValue,
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
          <div className={classes.OptionalHeader}>
            Additional Course Information (optional)
          </div>
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
      {resource === 'activities' && (
        <Select
          className={classes.Select}
          inputId="GradeSelect"
          onChange={(selectedOption) => gradeSelectHandler(selectedOption)}
          value={gradeSelectValue}
          options={gradeSelectOptions}
          isSearchable={false}
          placeholder="Choose Grade Level"
        />
      )}
    </div>
  );
};

Step1.propTypes = {
  displayResource: PropTypes.string.isRequired,
  changeHandler: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  district: PropTypes.string,
  school: PropTypes.string,
  organization: PropTypes.string,
  gradeSelectHandler: PropTypes.func,
  gradeSelectOptions: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, value: PropTypes.number })
  ),
  gradeSelectValue: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.number,
  }),
};

Step1.defaultProps = {
  district: '',
  school: '',
  organization: '',
  gradeSelectHandler: null,
  gradeSelectOptions: null,
  gradeSelectValue: null,
};

export default Step1;
