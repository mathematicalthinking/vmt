import React from 'react';
import { SelectionList,} from '../../../Components';
// import classes from '../create.css';
const Step2Copy = React.memo((props) => {

  return <SelectionList list='activities' selectItem={props.addActivity} />
})
export default Step2Copy;