import React, { Component } from 'react';
import NewResource from '../../Containers/Create/NewResource/NewResource';
import classes from './facilitator.css';
class FacilitatorInstructions extends Component{
  
  render() {
    return (
      <div className={classes.Container}>
        <div className={[classes.FixedTop, classes.Center].join(' ')}>
          <h1 className={classes.Title}>Become a Facilitator</h1>
          <div className={classes.Cards}>
            <div className={classes.CardContainer}>
              <h2 className={classes.FeatureName}>Create</h2>
              <div className={classes.Card}>
              </div>
            </div>
            <div className={classes.CardContainer}>
              <h2 className={classes.FeatureName}>Invite</h2>
              <div className={classes.Card}></div>
            </div>
            <div className={classes.CardContainer}>
              <h2 className={classes.FeatureName}>Manage</h2>
              <div className={classes.Card}>
              
              </div>
            </div>
          </div>
        </div>
        <div className={classes.Center}>
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
      </div>
    )
  }
}

export default FacilitatorInstructions;