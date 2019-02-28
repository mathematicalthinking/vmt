import React, { Component } from "react";
import { Aux, TextInput } from "../../../Components";
import threeD from "./images/3d.png";
import classic from "./images/classic.png";
import graphing from "./images/graphing.png";
import geometry from "./images/geometry.png";
import classes from "./roomOpts.css";

const ggbOpts = [
  { img: classic, name: "Classic", appName: "classic" },
  { img: threeD, name: "3D", appName: "3d" },
  { img: graphing, name: "Graphing", appName: "graphing" },
  { img: geometry, name: "Geometry", appName: "geometry" }
];
class RoomOpts extends Component {
  render() {
    if (this.props.ggb) {
      return (
        <div className={classes.RoomOpts}>
          <p>Select a GeoGebra App</p>
          <div className={classes.Container}>
            {ggbOpts.map(opt => (
              <div
                className={classes.Opt}
                onClick={() => {
                  this.props.setGgbApp(opt.appName);
                }}
              >
                <div
                  className={
                    this.props.appName === opt.appName
                      ? classes.Selected
                      : classes.GgbIcon
                  }
                >
                  <img src={opt.img} alt="classic" />
                </div>
                <h3 className={classes.OptText}>{opt.name}</h3>
              </div>
            ))}
          </div>
          <p>or upload a GeoGebra file</p>
          <div>
            <div className={classes.Geogebra}>
              <input
                type="file"
                id="file"
                multiple={true}
                name="ggbFile"
                accept=".ggb"
                onChange={this.props.setGgbFile}
              />
            </div>
          </div>
          {!this.props.tab ? (
            <p>(optional, click next if you wish to skip this step)</p>
          ) : null}
        </div>
      );
    } else
      return (
        <Aux>
          <TextInput
            light
            name="desmosLink"
            label="Paste a Desmos workspace"
            value={this.props.desmosLink}
            change={this.props.setDesmosLink}
            width="100%"
          />
        </Aux>
      );
  }
}

export default RoomOpts;
