import React from "react";
import classes from "./tools.css";
import { Link } from "react-router-dom";

const ActivityTools = React.memo(props => {
  return (
    <div className={classes.Container}>
      <h3 className={classes.Title}>Tools</h3>
      <div
        className={true ? classes.Expanded : classes.Collapsed}
        data-testid="current-members"
      >
        {props.owner ? (
          <div>
            <p>
              As the owner of this activity you can make changes to initial
              construction.
            </p>
            <p>
              Once you are ready to collaborate on this activity you can click
              "Exit Activity" and then select "Assign Activity". You can then
              decide who you want to collaborate with.
            </p>
            <p>
              When you click "Assign" this activity will be copied to a room
              where you can begin collaborating.
            </p>
            <p>
              For more information click{" "}
              <Link className={classes.Link} to="/about">
                here
              </Link>
            </p>
            <div className={classes.Save}>
              <div
                className={classes.SideButton}
                role="button"
                onClick={props.save}
              >
                save
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p>
              If you want to make changes to this activity, copy it to your list
              of activities first.
            </p>
            <br />
            <p>
              After you copy it you can create your own rooms from this activity
              and invite others to collaborate with you.
            </p>
            <div className={classes.Save}>
              <div
                className={classes.SideButton}
                role="button"
                onClick={props.copy}
              >
                copy this activity
              </div>
            </div>
          </div>
        )}
        <div className={classes.Controls}>
          <div
            className={[classes.SideButton, classes.Exit].join(" ")}
            role="button"
            onClick={props.goBack}
            theme={"Small"}
            data-testid="exit-room"
          >
            Exit Activity
          </div>
        </div>
      </div>
    </div>
  );
});

export default ActivityTools;
