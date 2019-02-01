import React, { Component } from "react";
import CustomLink from "../../Components/Navigation/CustomLink/CustomLink";
import NewResource from "../../Containers/Create/NewResource/NewResource";
import classes from "./facilitator.css";
class FacilitatorInstructions extends Component {
  componentDidMount() {}

  render() {
    return (
      <div className={classes.Container}>
        <div className={classes.Center}>
          <h1 className={classes.Title}>Become a Facilitator</h1>
          <div className={classes.Cards}>
            <div className={classes.CardContainer}>
              <h2 className={classes.FeatureName}>Create</h2>
              <div className={classes.Card} />
            </div>
            <div className={classes.CardContainer}>
              <h2 className={classes.FeatureName}>Invite</h2>
              <div className={classes.Card} />
            </div>
            <div className={classes.CardContainer}>
              <h2 className={classes.FeatureName}>Manage</h2>
              <div className={classes.Card} />
            </div>
          </div>
        </div>
        <div className={classes.Center}>
          <h2 className={classes.FeatureName}>
            To get started try creating something
          </h2>
          <div className={classes.Cards}>
            <div className={classes.CardContainer}>
              <div className={classes.CreateTitle}>Activity</div>
              <NewResource resource={"activities"} intro />
            </div>
            <div className={classes.CardContainer}>
              <div className={classes.CreateTitle}>Room</div>
              <NewResource resource={"rooms"} intro />
            </div>

            <div className={classes.CardContainer}>
              <div className={classes.CreateTitle}>Course</div>
              <NewResource resource={"courses"} intro />
            </div>
          </div>
          <p className={classes.Tutorial}>
            What's the difference between an activity and a room? To learn about
            how VMT works, try one of our{" "}
            <CustomLink to="tutorials">tutorials</CustomLink>
          </p>
        </div>
        {/* <div className={[classes.Center, classes.Invite].join(' ')}>
            <div className={classes.Cards}>
              <div className={classes.Card}>
                <NewResource resource={'activities'} intro/>
              </div>
              <div className={classes.Card}>
                <NewResource resource={'courses'} intro/>
              </div>
              <div className={classes.Card}>
                <NewResource resource={'rooms'} intro/>
              </div>
            </div>
          </div>
          <div className={[classes.Center, classes.Manage].join(' ')}>
            <div className={classes.Cards}>
              <div className={classes.Card}>
                <NewResource resource={'activities'} intro/>
              </div>
              <div className={classes.Card}>
                <NewResource resource={'courses'} intro/>
              </div>
              <div className={classes.Card}>
                <NewResource resource={'rooms'} intro/>
              </div>
            </div>
          </div> */}
      </div>
    );
  }
}

export default FacilitatorInstructions;
