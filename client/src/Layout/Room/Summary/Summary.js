import React from 'react';
import classes from './summary.css';
import Button from '../../../Components/UI/Button/Button';
const summary = props => {
  console.log(props)
  const clickHandler = () => {
    props.history.push(`/workspace/${props.room._id}`);
  }
  return (
    <div className={classes.Container}>
      <div className={classes.Section}>
        {props.room.currentUseres}
      </div>
      <div className={classes.Section}>
        <div>Events: </div>{props.room.events ? props.room.length : 0}
      </div>
      <div className={classes.Section}>
        <Button click={clickHandler}>Join</Button>
      </div>
    </div>
  )
}

export default summary;
