import React from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import classes from './instructions.css';
import { Aux, DemoBrowser, Iframe } from '../../Components';
// import example1 from './studentLogin1.gif';
import example2 from './studentLogin2.gif';
import example3 from './studentLogin3.gif';
import example4 from './createAssignTemplate1.gif';
import example5 from './createAssignTemplate2.gif';

const Instructions = () => {
  return (
    <Aux>
      <div
        className={classes.BackgroundContainer}
        style={{ height: document.body.scrollHeight }}
      >
        <div className={classes.Background} />
      </div>
      <div className={classes.Container}>
        <div className={classes.Banner}>
          <h2 id="top" className={classes.Tagline}>
            Virtual Math Teams (VMT) Instructions
          </h2>
        </div>
        <div className={classes.QuickLinks}>
          <Link to="/instructions#codeLogin" className={classes.Links}>
            Student Login with code
          </Link>
          <Link to="/instructions#template" className={classes.Links}>
            Creating and Assigning Templates{' '}
          </Link>
        </div>
        <br />
        <div className={classes.Header}>
          Interactive Map of the VMT Collaborative Mathspace
        </div>
        <div className={classes.RoomDemo}>
          <Iframe source="https://view.genial.ly/615555bba4670a10262ee271" />
        </div>
        <br />
        <div className={classes.Header}> Student Login </div>
        <div id="codeLogin" className={classes.Content}>
          <DemoBrowser>
            <img src={example2} height={320} alt="student-login-with-code-1" />
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
                &quot;Enter.&quot; <br /> Then confirm that it is taking you to
                the right place. If so, click the button, &quot;Yes, looks
                right.&quot;
              </li>
              <li className={classes.ListItem}>
                Click on your username in the &quot;Member List.&quot;{' '}
              </li>
              <li className={classes.ListItem}>
                To confirm your username, click either &quot;Yes let’s go&quot;
                (or Sign in with Google if required)
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
        <br />
        <br />
        <div className={classes.Header}> Creating and Assigning Templates </div>
        <div id="template" className={classes.Content}>
          <DemoBrowser>
            <img src={example4} height={320} alt="screate-assign-template-1" />
          </DemoBrowser>
          <p className={classes.Description}>
            <ol type="1" className={classes.List}>
              <li className={classes.ListItem}>
                From &quot;My VMT,&quot; click &quot;Templates.&quot;{' '}
              </li>
              <li className={classes.ListItem}>
                Click the blue &quot;Create +&quot; button that appears at
                right.
              </li>
              <li className={classes.ListItem}>
                Give your template a name and -- if you like -- a description.
                Then click &quot;Create a new template.&quot;
              </li>
              <li className={classes.ListItem}>
                Select the rightmost option, &quot;Desmos Activity,&quot; then
                click &quot;Next.&quot;
              </li>
              <li className={classes.ListItem}>
                Paste in the URL of a Desmos activity. Then click
                &quot;Next.&quot;
              </li>
              <li className={classes.ListItem}>
                Choose Public or Private, and click &quot;Create.&quot;
              </li>
            </ol>
          </p>
        </div>
        <div className={classes.Intermediate}>
          You’ve created a template. Now let’s use it to make any number of
          identical rooms based on that template. If your roster of students is
          already in this course, you can assign those rooms to your students.
        </div>
        <div className={classes.Content}>
          <p className={classes.Description}>
            <ol type="1" className={classes.List}>
              <li className={classes.ListItem}>
                Click &quot;Assign Template.&quot;
              </li>
              <li className={classes.ListItem}>Pick a Due Date (or not). </li>
              <li className={classes.ListItem}>
                In the box below &quot;Add Participants,&quot; start typing
                usernames or email addresses, such as vistausd.org. As you type,
                VMT will auto-complete matching participants.
              </li>
              <li className={classes.ListItem}>
                Click the checkboxes of the participants you want to add to
                rooms made from this template. When you have them all, click
                &quot;Next.&quot;{' '}
              </li>
              <li className={classes.ListItem}>
                To create rooms based on your template, on &quot;Assign to
                Rooms&quot; either type in the number of identical rooms or
                click the up arrow to the right. As you change the number of
                rooms, VMT starts enumerating (Room 1, Room 2, Room 3, etc.) new
                columns of a table of checkboxes with participants as rows.
              </li>
              <li className={classes.ListItem}>
                Check the boxes at the intersection of column and row that
                correspond with which participant you want to assign to which
                room. When done, click &quot;Assign.&quot;{' '}
              </li>
            </ol>
          </p>
          <DemoBrowser>
            <img
              className={classes.Image}
              src={example5}
              alt="create-assign-template-2"
            />
          </DemoBrowser>
        </div>
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
