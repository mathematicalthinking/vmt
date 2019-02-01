import React from "react";
import { SelectionList, Aux } from "../../../Components";
// import classes from '../create.css';
const Step2Copy = React.memo(props => {
  return (
    <Aux>
      <p>Select one or many activities to copy</p>
      <SelectionList list="activities" selectItem={props.addActivity} />
    </Aux>
  );
});
export default Step2Copy;
