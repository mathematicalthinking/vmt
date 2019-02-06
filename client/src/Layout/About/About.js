import React from "react";
import classes from "./about.css";
import example1 from "./example1.gif";
import { Background, Aux, DemoBrowser } from "../../Components";
const About = () => {
  return (
    <Aux>
      <div className={classes.BackgroundContainer}>
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
            <img src={example1} alt="example-1" />
          </DemoBrowser>
          <p className={classes.Description}>
            VMT leverages GeoGebra and Desmos
          </p>
        </div>
      </div>
    </Aux>
  );
};

export default About;
