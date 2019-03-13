import React, { Component } from "react";
import { Avatar, ToolTip } from "../../../Components";
import classes from "./tools.css";
import ggbTools from "./GgbIcons/";

class Awareness extends Component {
  state = {
    showToolTip: false
  };
  render() {
    let { awarenessDesc, awarenessIcon } = this.props;
    // If the awareness is of a tool being selected
    let awareness;
    if (ggbTools[awarenessIcon]) {
      awareness = (
        <div className={classes.AwarenessDesc}>
          {awarenessDesc}
          <a
            className={classes.AwarenessIcon}
            href={ggbTools[awarenessIcon].link}
            onMouseOver={() => this.setState({ showToolTip: true })}
            onMouseOut={() => this.setState({ showToolTip: false })}
          >
            <img
              src={ggbTools[awarenessIcon].image}
              height={40}
              href={ggbTools[awarenessIcon].link}
              alt={awarenessIcon}
            />
            <ToolTip visible={this.state.showToolTip}>
              {ggbTools[awarenessIcon].name.toLowerCase().replace("_", " ")}
            </ToolTip>
          </a>
          tool
        </div>
      );
    }
    return (
      <div className={classes.ReferenceControls}>
        <i className="far fa-eye" />
        {awareness}
      </div>
    );
  }
}

export default Awareness;
