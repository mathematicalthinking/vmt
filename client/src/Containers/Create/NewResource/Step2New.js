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
      <div>
        {props.ggb ? (
          <div className={classes.Geogebra}>
            <input
              type="file"
              id="file"
              multiple={true}
              name="ggbFile"
              accept=".ggb"
              onChange={props.setGgbFile}
            />
            {/* <label for='file'>
              <i className={["fas fa-file-upload", classes.UploadIcon].join(' ')}></i>
              <p>click "Choose Files" or drag and drop files here.</p>
            </label> */}
          </div>
        ) : (
          <TextInput
            light
            name="desmosLink"
            label="Paste a Desmos workspace"
            value={props.desmosLink}
            change={props.changeHandler}
            width="100%"
          />
        )}
      </div>
      <p>(optional, click next if you wish to skip this step)</p>
    </div>
  );
};

export default Step2New;
