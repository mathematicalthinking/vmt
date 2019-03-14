import React, { Component } from "react";
import { Avatar, ToolTip, Aux } from "../../../Components";
import classes from "./tools.css";
import ggbTools from "./GgbIcons/";

class Awareness extends Component {
  state = {
    showToolTip: false
  };
  render() {
    let { awarenessDesc, awarenessIcon } = this.props;
    console.log("tools: ", awarenessDesc, awarenessIcon);
    // If the awareness is of a tool being selected

    return (
      <div className={classes.AwarenessDesc}>
        {awarenessDesc}
        <a
          className={classes.AwarenessIcon}
          onMouseOver={() => this.setState({ showToolTip: true })}
          onMouseOut={() => this.setState({ showToolTip: false })}
        >
          {awarenessIcon ? (
            <Aux>
              <img
                src={ggbTools[awarenessIcon].image}
                height={40}
                href={ggbTools[awarenessIcon].link}
                alt={awarenessIcon}
              />

              <ToolTip visible={this.state.showToolTip}>
                {ggbTools[awarenessIcon].name.toLowerCase().replace("_", " ")}
              </ToolTip>
            </Aux>
          ) : null}
        </a>
        tool
      </div>
    );
  }
}

export default Awareness;
