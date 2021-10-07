import React from 'react';
import classes from './notfound.css';
import { Aux } from '../../Components';

const NotFound = () => {
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
          <h2 className={classes.Tagline}>
            2<sup className={classes.Sup}>2</sup> x 101 =
          </h2>
        </div>
        <div className={classes.Content}>
          <p className={classes.Description}>
            404: We couldn&#39;t find the page you requested.
          </p>
        </div>
      </div>
    </Aux>
  );
};

export default NotFound;
