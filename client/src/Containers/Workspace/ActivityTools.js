import React from 'react';
import classes from './tools.css';

const ActivityTools = React.memo((props) => {
  return (
    <div className={classes.Container}>
      <h3 className={classes.Title}>Tools</h3>
      <div className={(true ? classes.Expanded : classes.Collapsed)} data-testid='current-members'>
        {props.owner
          ? <div>
              <p>Some brief instructions about what the activity owner can do here</p>
              <div className={classes.Save}>
                <div className={classes.SideButton} role="button" onClick={props.save}>save</div>
              </div>
            </div>
          : <div>
              <p>If you want to make changes to this activity, copy it to your list of activities first.</p>
              <br></br>
              <p>After you copy it you can create your own rooms from this activity and invite others to collaborate with you.</p>
              <div className={classes.Save}>
                <div className={classes.SideButton} role="button" onClick={props.copy}>copy this activity</div>
              </div>
            </div>
        }
        <div className={classes.Controls}>
          <div className={[classes.SideButton, classes.Exit].join(" ")} role="button" onClick={props.goBack} theme={'Small'} data-testid='exit-room'>Exit Room</div>
        </div>
      </div>
    </div>
  )
})

export default ActivityTools;