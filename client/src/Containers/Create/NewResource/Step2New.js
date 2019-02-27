import React from "react";
import { RadioBtn, TextInput } from "../../../Components/";
import classes from "../create.css";
const Step2New = props => {
  return (
    <div className={classes.Step3}>
      <div className={classes.RadioButtons}>
        <RadioBtn name="geogebra" checked={props.ggb} check={props.setGgb}>
          GeoGebra
        </RadioBtn>
        <RadioBtn name="desmos" checked={!props.ggb} check={props.setGgb}>
          Desmos
        </RadioBtn>
      </div>
    </div>
  );
};

export default Step2New;
