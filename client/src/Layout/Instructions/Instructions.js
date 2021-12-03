import React, { Fragment } from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import classes from './instructions.css';
import { Aux, DemoBrowser, Iframe } from '../../Components';
// import example1 from './studentLogin1.gif';
import example2 from './studentLogin2.gif';
import example3 from './studentLogin3.gif';

const Instructions = () => {
  return (
    <Aux>
      <div
        className={classes.BackgroundContainer}
        style={{ height: document.body.scrollHeight }}
      >
        <div className={classes.Background} />
      </div>
      <div className={`${classes.PrintSection} ${classes.Container}`}>
        <div className={classes.Banner}>
          <h2 id="top" className={classes.Tagline}>
            Virtual Math Teams (VMT) Instructions
            <hr />
            Participant Instructions
          </h2>
        </div>
        <div className={classes.QuickLinks}>
          Click for Teacher instructions:
          <br />{' '}
          <Link to="/instructions/facilitator" className={classes.Links}>
            Facilitator Instructions{' '}
          </Link>
        </div>
        <div className={classes.QuickLinks}>
          Sections:
          <br />{' '}
          <Link to="/instructions#codeLogin" className={classes.Links}>
            Student Login with code
          </Link>
        </div>
        <br />

        <Fragment>
          <div className={`${classes.Header} ${classes.NoPrint}`}>
            Interactive Map of the VMT Collaborative Mathspace
          </div>
          <div className={`${classes.RoomDemo} ${classes.NoPrint}`}>
            <Iframe source="https://view.genial.ly/615555bba4670a10262ee271" />
          </div>
        </Fragment>

        <br />

        <Fragment>
          <div className={classes.Header}> Student Login </div>
          <div id="codeLogin" className={classes.Content}>
            <DemoBrowser>
              <img
                src={example2}
                height={320}
                alt="student-login-with-code-1"
              />
            </DemoBrowser>
            <p className={classes.Description}>
              <ol type="1" className={classes.List}>
                <li className={classes.ListItem}>
                  Go to vmt.mathematicalthinking.org
                </li>
                <li className={classes.ListItem}>
                  Click the button &quot;Enter with a Class Code&quot;
                </li>
                <li className={classes.ListItem}>
                  Put in the code given by your teacher, and click
                  &quot;Enter.&quot; <br /> Then confirm that it is taking you
                  to the right place. If so, click the button, &quot;Yes, looks
                  right.&quot;
                </li>
                <li className={classes.ListItem}>
                  Click on your username in the &quot;Member List.&quot;{' '}
                </li>
                <li className={classes.ListItem}>
                  To confirm your username, click either &quot;Yes let’s
                  go&quot; (or Sign in with Google if required)
                </li>
              </ol>
            </p>
          </div>
          <div className={classes.Content}>
            <p className={classes.Description}>
              <ol type="1" start="6" className={classes.List}>
                <li className={classes.ListItem}>
                  In MyVMT, click on a room name to go to the room lobby.
                </li>
                <li className={classes.ListItem}>
                  Read the instructions, if there are any.{' '}
                </li>
                <li className={classes.ListItem}>
                  From the bottom left, click the blue &quot;Enter.&quot; button
                  to go in and start collaborating!
                </li>
              </ol>
            </p>
            <DemoBrowser>
              <img
                className={classes.Image}
                src={example3}
                alt="student-login-with-code-2"
              />
            </DemoBrowser>
          </div>
        </Fragment>
        <br />
        <br />
        <Link to="/instructions#top" className={classes.Links}>
          Back to Top
        </Link>
        <br />
      </div>
    </Aux>
  );
};

export default Instructions;
