import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classes from './tools.css';

const ActivityTools = (props) => {
  const { owner, copy, goBack, tabs } = props;
  const [WSPTabType, setWSPTabType] = useState(() =>
    tabs.some((tab) => tab.tabType === 'wsp')
  );
  const [DesTabType, setDesTabType] = useState(() =>
    tabs.some((tab) => tab.tabType === 'desmosActivity')
  );
  const tabdata = tabs.map((tab) => {
    if (tab.tabType === 'desmosActivity' && tab.desmosLink) {
      // Desmos Base URL: https://teacher.desmos.com/activitybuilder/custom/
      return (
        <div>
          {tab.name}:{' '}
          <a
            className={classes.Link}
            target="_blank"
            rel="noopener noreferrer"
            href={`https://teacher.desmos.com/activitybuilder/custom/${tab.desmosLink}`}
            data-testid="desmos-link"
          >
            Base configuration at Teacher.Desmos
          </a>
        </div>
      );
    }
    return null;
  });
  return (
    <div className={classes.Container}>
      <h3 className={classes.Title}>Tools</h3>
      <div className={classes.Expanded} data-testid="current-members">
        {owner ? (
          <div>
            <p data-testid="owner-msg">
              As the owner of this template you can make changes to initial
              construction.
            </p>
            <br />
            <p>
              Once you are ready to collaborate on this template you can click
              &quot;Exit Template&quot; and then select &quot;Assign
              Template&quot;. You can then decide who you want to collaborate
              with.
            </p>
            <br />
            <p>
              When you click &quot;Assign&quot; this template will be copied to
              a room where you can begin collaborating.
            </p>
            <p>
              For more information click{' '}
              <Link
                className={classes.Link}
                to="/instructions"
                data-testid="about-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </Link>
              {'. '}
            </p>
            <br />
            {tabdata}
            <br />
            {DesTabType && (
              <Fragment>
                Desmos Activity editing is in draft within VMT. Find more at{' '}
                <a
                  className={classes.Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://teacher.desmos.com/"
                  data-testid="desmos-link"
                >
                  teacher.desmos.com
                </a>
              </Fragment>
            )}
            {WSPTabType && (
              <Fragment>
                WebSketch Pad Template editing is only partially supported
                within VMT. Visit the{' '}
                <a
                  className={classes.Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://geometricfunctions.org/fc/tools/library/?debug=true"
                  data-testid="wsp-link"
                >
                  WebSketch Tool Library
                </a>{' '}
                to access all of the available tools and configuration options
                when creating your WSP template. When done, download the file in
                .json format to upload to VMT.
              </Fragment>
            )}
            <div className={classes.Save}>
              <div
                className={classes.SideButton}
                role="button"
                tabIndex="-3"
                onKeyPress={copy}
                onClick={copy}
                data-testid="copy-template"
              >
                copy this template
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p>
              If you want to make changes to this template, copy it to your list
              of activity templates first.
            </p>
            <br />
            <p>
              After you copy it you can create your own rooms from this template
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
                copy this template
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
            Exit Template
          </div>
        </div>
      </div>
    </div>
  );
};

ActivityTools.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  owner: PropTypes.bool.isRequired,
  // save: PropTypes.func,
  copy: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
};

// ActivityTools.defaultProps = {
//   save: null,
// };

export default ActivityTools;
