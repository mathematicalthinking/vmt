import React from 'react';
import classes from './about.css';
import example1 from './example1.gif';
import example2 from './example2.gif';
import example3 from './example3.gif';
import example4 from './example4.gif';
import { Aux, DemoBrowser } from '../../Components';

const About = () => {
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
            Virtual Math Teams (VMT) provides a collaborative environment for
            exploring the world of math...
          </h2>
        </div>
        <div className={classes.Content}>
          <DemoBrowser>
            <img src={example1} height={320} alt="example-1" />
          </DemoBrowser>
          <p className={classes.Description}>
            VMT uses{' '}
            <a
              className={classes.Link}
              href="https://www.geogebra.org/"
              rel="noopener noreferrer"
              target="_blank"
            >
              GeoGebra
            </a>{' '}
            and{' '}
            <a
              className={classes.Link}
              href="https://www.desmos.com/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Desmos
            </a>{' '}
            as the underlying workspace so you instantly have access to millions
            of activities created by teachers and math enthusiasts around the
            world.
          </p>
        </div>
        <div className={classes.Content}>
          <p className={classes.Description}>
            Teachers can manage their classrooms and curriculum by creating
            courses and resusable activities...
          </p>
          <DemoBrowser>
            <img className={classes.Image} src={example2} alt="example-2" />
          </DemoBrowser>
        </div>
        <div className={classes.Content}>
          <DemoBrowser>
            <img src={example3} alt="example-3" />
          </DemoBrowser>
          <p className={classes.Description}>
            ...Or anyone can start collaborating immediately simply by inviting
            another VMT member to their room
          </p>
        </div>
        <div className={classes.Content}>
          <p className={classes.Description}>
            All of the work done in a room is replayable, allowing teachers and
            researchers to gain richer insights into student work and
            collaborative thought processes.
          </p>
          <DemoBrowser>
            <img src={example4} alt="example-4" />
          </DemoBrowser>
        </div>
      </div>
    </Aux>
  );
};

export default About;
