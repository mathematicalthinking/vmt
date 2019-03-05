import React from "react";
import { RadioBtn, Aux } from "../../../Components/";
import classes from "../create.css";
const Step2New = props => {
  return (
    <Aux>
      <p style={{ marginBottom: 10 }}>Select a worksapce type</p>
      <div className={classes.RadioButtons}>
        <RadioBtn name="geogebra" checked={props.ggb} check={props.setGgb}>
          GeoGebra
        </RadioBtn>
        <RadioBtn name="desmos" checked={!props.ggb} check={props.setGgb}>
          Desmos
        </RadioBtn>
      </div>
    </Aux>
  );
};

export default Step2New;
