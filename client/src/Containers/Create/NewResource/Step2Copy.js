import React from 'react';
import PropTypes from 'prop-types';
import { SelectionList, Aux } from '../../../Components';

// import classes from '../create.css';
const Step2Copy = props => {
  const { addActivity } = props;
  return (
    <Aux>
      <p>Select one or many activities to copy</p>
      <SelectionList list="activities" selectItem={addActivity} />
    </Aux>
  );
};

Step2Copy.propTypes = {
  addActivity: PropTypes.func.isRequired,
};
export default Step2Copy;
