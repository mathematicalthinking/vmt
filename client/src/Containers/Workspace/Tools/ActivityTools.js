import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classes from './tools.css';

const ActivityTools = (props) => {
  const { owner, copy, goBack } = props;
  return (
    <div className={classes.Container}>
      <h3 className={classes.Title}>Tools</h3>
      <div className={classes.Expanded} data-testid="current-members">
        {owner ? (
          <div>
            <p data-testid="owner-msg">
              As the owner of this activity you can make changes to initial
              construction.
            </p>
            <p>
              Once you are ready to collaborate on this activity you can click
              &#147; Exit Activity &#148; and then select &#147;Assign
              Activity&#148;. You can then decide who you want to collaborate
              with.
            </p>
            <p>
              When you click &#147;Assign&#148; this activity will be copied to
              a room where you can begin collaborating.
            </p>
            <p>
              For more information click{' '}
              <Link
                className={classes.Link}
                to="/about"
                data-testid="about-link"
              >
                here
              </Link>
            </p>
            {/* <div className={classes.Save}>
              <div
                className={classes.SideButton}
                role="button"
                tabIndex="-2"
                onKeyPress={save}
                onClick={save}
                data-testid="save-activity"
              >
                save
              </div>
            </div> */}
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
                tabIndex="-3"
                onKeyPress={copy}
                onClick={copy}
                data-testid="copy-activity"
              >
                copy this activity
              </div>
            </div>
          </div>
        )}
        <div className={classes.Controls}>
          <div
            className={[classes.SideButton, classes.Exit].join(' ')}
            role="button"
            tabIndex="-4"
            onClick={goBack}
            onKeyPress={goBack}
            theme="Small"
            data-testid="exit-room"
          >
            Exit Activity
          </div>
        </div>
      </div>
    </div>
  );
};

ActivityTools.propTypes = {
  owner: PropTypes.bool.isRequired,
  // save: PropTypes.func,
  copy: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
};

// ActivityTools.defaultProps = {
//   save: null,
// };

export default ActivityTools;
