import React, { Component } from "react";
import { Aux } from "../../../Components";
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
        <Aux>
          <p>Select a GeoGebra App</p>
          <div className={classes.Container}>
            {ggbOpts.map(opt => (
              <div
                className={classes.Opt}
                onClick={() => {
                  this.props.setGgbApp(opt.appName);
                }}
              >
                <div className={classes.GgbIcon}>
                  <img src={opt.img} alt="classic" />
                </div>
                <h3 className={classes.OptText}>{opt.name}</h3>
              </div>
            ))}
          </div>
        </Aux>
      );
    } else return <Aux>Desmos</Aux>;
  }
}

export default RoomOpts;
