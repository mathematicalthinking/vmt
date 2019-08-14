import React from 'react';
import { Button } from '../../../Components';

const Step1 = React.memo((props) => {
  return (
    <div>
      <Button>Create a New {props.resource}</Button>
      <Button>Create From an Existing Activity</Button>
    </div>
  );
});

export default Step1;
