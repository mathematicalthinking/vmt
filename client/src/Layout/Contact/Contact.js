import React from 'react';
import classes from './contact.css';
import { Aux } from '../../Components';

const Contact = () => {
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
            VMT: Contact us
          </h1>
          <h2 className={classes.Banner}>
            Thank you for your interest in improving VMT!{<br />}
            Ways to get in touch:
          </h2>
        </div>
        <div className={classes.Content}>
          <h3>1. Email:</h3>
          <p className={classes.Description}>
            Drop a message to the VMT Team via:{' '}
            <a
              className={classes.Link}
              href="mailto:vmt@21pstem.org?subject=%5BVMT%20Feedback%5D"
            >
              vmt@21pstem.org
            </a>{' '}
          </p>
        </div>
        <div className={classes.Content}>
          <h3>2. Mail:</h3>
          <p className={classes.Description}>
            21PSTEM - Mathematical Thinkers Like Me
            {<br />} 375 East Elm,
            {<br />} Suite 215 Conshohocken, PA 19428 {<br />}{' '}
          </p>
        </div>
        <div className={classes.Content}>
          <h3>3. Github:</h3>
          <p className={classes.Description}>
            Visit the repo and contribute at:{' '}
            <a
              className={classes.Link}
              href="https://github.com/mathematicalthinking/vmt"
            >
              github.com/mathematicalthinking/vmt
            </a>
          </p>
        </div>
        <br />
      </div>
    </Aux>
  );
};

export default Contact;
