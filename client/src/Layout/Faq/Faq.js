import React from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import classes from './faq.css';
import { Aux } from '../../Components';

const Faq = () => {
  return (
    <Aux>
      <div
        className={classes.BackgroundContainer}
        style={{ height: document.body.scrollHeight }}
      >
        <div className={classes.Background} />
      </div>
      <div className={classes.Container}>
        <div>
          <h1 id="top" className={classes.Tagline}>
            VMT: Frequently Asked Questions
          </h1>
        </div>
        <div className={classes.Content}>
          <h3>
            1. Why should I try VMT? What makes it different? Does it actually
            work?
          </h3>
          <p className={classes.Description}>
            VMT is designed for online collaborative problem solving and
            story-telling, with an innovative context that integrates a focus on
            executive functions in practice, while developing conceptual
            understanding and fostering equity. This student-first appraoch
            seeks to provide an educational experience through the collaborative
            process and capturing the ideas that materialize throughout the
            mathematical process.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>2. Who made VMT? Who owns it?</h3>
          <p className={classes.Description}>
            VMT is developed and maintained by the 21st Century Partnership for
            STEM Education{' '}
            <a
              className={classes.Link}
              href="https://www.21pstem.org/mathematical-thinkers"
            >
              (21PSTEM.org)
            </a>
            , and is grant funded under the Mathematical Thinkers Like Me
            Project under the EF+Math Grant initiative. This software is open
            source and we welcome collaboration!
          </p>
        </div>
        <div className={classes.Content}>
          <h3>
            3. Who can see my (or my students&#39;) data? Who controls it?
          </h3>
          <p className={classes.Description}>
            21PSTEM takes data and user privacy seriously- data is securely
            maintained via 21PSTEM and only accessible through approved research
            team members. {<br />}Please see our{' '}
            <Link to="/terms#privacy" className={classes.Link}>
              Privacy Policy
            </Link>{' '}
            for detailed information.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>
            4. Should I sign up as a participant or as a facilitator? What&#39;s
            the difference?
          </h3>
          <p className={classes.Description}>
            It really doesn&#39;t matter- you can concert to a facilitator at
            any time!{<br />}A facilitator is able to create and manage
            resources, such as Rooms or Courses. Participants can only join
            them.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>5. How many people can be in a room?</h3>
          <p className={classes.Description}>
            There technically itsn&#39;t a set limit, however it is recomended
            to keep the number of participants at one time under 10 or so. The
            collaborative aspects of VMT work best with a room of about 5
            participants. By creating a Template, multiple instances of Rooms
            can easily be created and assigned to participants.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>6. What types of activities are supported within Rooms?</h3>
          <p className={classes.Description}>
            VMT supports a number of different types of mathspaces:
            <ul>
              <li>
                <a className={classes.Link} href="https://www.geogebra.org/">
                  GeoGebra
                </a>{' '}
                : A dynamic geometry software
              </li>
              <li>
                <a className={classes.Link} href="https://www.desmos.com/">
                  Desmos
                </a>{' '}
                : A fully-featured online graphing calculator
              </li>
              <li>
                <a className={classes.Link} href="https://teacher.desmos.com/">
                  Desmos Activities
                </a>{' '}
                : Flexible and interactive mathspaces
              </li>
              <li>
                Coming soon-{' '}
                <a
                  className={classes.Link}
                  href="https://www.pyret.org/pyret-code/"
                >
                  Pyret
                </a>{' '}
                : collaborative coding spaces
              </li>
            </ul>
          </p>
        </div>
        <div className={classes.Content}>
          <h3>7. What is a Template, Room, or Course?</h3>
          <p className={classes.Description}>
            Rooms are single instances wherein mathematical collaboration can
            occur with the members of that room. This is where users
            collectively think and communicate those thoughts to work through an
            activity. This work can then be replayed and the thought journey
            seen via the Room Replayer.{<br />}
            Templates are &#39;Starting Points&#39; from which individual Rooms
            can be created. These rooms then start with the activity content as
            defined in the Template.{<br />}
            Courses define collection of Templates, Rooms, and Users. Within a
            Course, a Template can be used to assign copies of Rooms to Members
            included within the Course.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>
            8. What is the difference between a Private and Public resource?
          </h3>
          <p className={classes.Description}>
            Private resources, such as a Course or Room, will require an
            entry-code to access. This allows for only the intended viewers or
            participants to see that resource and content. However, public
            resources allow for and invite greater collaboration and sharing of
            ideas!
          </p>
        </div>
        <div className={classes.Content}>
          <h3>
            9. As a facilitator, when would I want to create a template? a
            course?
          </h3>
          <p className={classes.Description}>
            Creating a template allows for multiple Rooms to be created (or
            assigned to VMT users) from the activity content within the
            Template. The advantage of creating a Course is limiting the VMT
            user context to a member list defined within the Course. This makes
            assigning Rooms and viewing work done by Course Members easy!
          </p>
        </div>
        <div className={classes.Content}>
          <h3>10. What is the little red bell?</h3>
          <p className={classes.Description}>
            The notification bell alerts Users to newly added or assigned
            Resources.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>11. What about referencing, what is that?</h3>
          <p className={classes.Description}>
            Referencing is a way to provide context to a chat message, by
            linking it to another chat or object within the mathspace.
          </p>
        </div>
        <div className={classes.Content}>
          <h3>12. How can I get Involved?</h3>
          <p className={classes.Description}>
            We welcome collaboration! VMT is{' '}
            <a
              className={classes.Link}
              href="https://github.com/mathematicalthinking/vmt"
            >
              open source
            </a>{' '}
            and you can share your thoughts with us via email at:{' '}
            <a
              className={classes.Link}
              href="mailto:vmt@21pstem.org?subject=%5BVMT%20Feedback%5D"
            >
              vmt@21pstem.org
            </a>{' '}
          </p>
        </div>
        <Link to="/terms#top" className={classes.Links}>
          Back to Top
        </Link>
        <br />
      </div>
    </Aux>
  );
};

export default Faq;
