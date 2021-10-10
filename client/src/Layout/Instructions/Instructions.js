import React from 'react';
import classes from './instructions.css';
import { Aux } from '../../Components';

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
          <h2 className={classes.Tagline}>Coming soon...</h2>
        </div>
        <div className={classes.Content}>
          <p className={classes.Description}>stay posted.</p>
        </div>
      </div>
    </Aux>
  );
};

export default Instructions;
