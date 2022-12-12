import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import CustomLink from '../../Components/Navigation/CustomLink/CustomLink';
import NewResource from '../../Containers/Create/NewResource/NewResource';
import classes from './facilitator.css';

class FacilitatorIntro extends Component {
  componentDidMount() {}

  render() {
    return (
      <div className={classes.Container}>
        <div className={classes.Center}>
          <h1 className={classes.Title}>Become a Facilitator</h1>
          <div className={classes.Cards}>
            <div className={classes.CardContainer}>
              <h2 className={classes.FeatureName}>Create</h2>
              <div className={classes.Card}>
                <i className="fas fa-object-group fa-7x" />
                <div className={classes.CreateTitle}>
                  Make resources, such as Rooms and Courses
                </div>
              </div>
            </div>
            <div className={classes.CardContainer}>
              <h2 className={classes.FeatureName}>Invite</h2>
              <div className={classes.Card}>
                <i className="fas fa-user-plus fa-7x" />
                <div className={classes.CreateTitle}>
                  Add other VMT users to collaborate{' '}
                </div>
              </div>
            </div>
            <div className={classes.CardContainer}>
              <h2 className={classes.FeatureName}>Manage</h2>
              <div className={classes.Card}>
                <i className="fas fa-wrench fa-7x" />
                <div className={classes.CreateTitle}>
                  See and Monitor resource activity{' '}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={classes.Center}>
          <h2 className={classes.FeatureName}>
            To get started try creating something
          </h2>
          <div className={classes.Cards}>
            <div className={classes.CardContainer}>
              <div className={classes.CreateTitle}>Template</div>
              <NewResource resource="activities" intro />
            </div>
            <div className={classes.CardContainer}>
              <div className={classes.CreateTitle}>Room</div>
              <NewResource resource="rooms" intro />
            </div>

            <div className={classes.CardContainer}>
              <div className={classes.CreateTitle}>Course</div>
              <NewResource resource="courses" intro />
            </div>
          </div>
          <p className={classes.Tutorial}>
            What&#39;s the difference between an activity and a room? To learn
            about how VMT works, check out the{' '}
            <CustomLink to="/faq">FAQs</CustomLink> or{' '}
            <CustomLink to="/instructions">Instructions</CustomLink>
            {/* <Link to="/instructions">instructions</Link>{' '} */}
            {/* <CustomLink to="tutorials">tutorials</CustomLink> */}
          </p>
        </div>
      </div>
    );
  }
}

export default FacilitatorIntro;
