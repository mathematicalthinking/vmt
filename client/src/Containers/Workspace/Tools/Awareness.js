import React, { Component } from "react";
import { Avatar, ToolTip, Aux } from "../../../Components";
import classes from "./tools.css";
import ggbTools from "./GgbIcons/";

class Awareness extends Component {
  state = {
    showToolTip: false
  };
  render() {
    let { lastEvent } = this.props;
    // console.log("tools: ", awarenessDesc, awarenessIcon);
    // If the awareness is of a tool being selected
    console.log(lastEvent);
    return (
      <div className={classes.AwarenessDesc}>
        {lastEvent.description}
        <a
          className={classes.AwarenessIcon}
          onMouseOver={() => this.setState({ showToolTip: true })}
          onMouseOut={() => this.setState({ showToolTip: false })}
        >
          {lastEvent.action === "mode" ? (
            <Aux>
              <img
                src={ggbTools[lastEvent.label].image}
                height={40}
                href={ggbTools[lastEvent.label].link}
                alt={"tool_icon"}
              />

              <ToolTip visible={this.state.showToolTip}>
                {ggbTools[lastEvent.label].name.toLowerCase().replace("_", " ")}
              </ToolTip>
            </Aux>
          ) : null}
        </a>
      </div>
    );
  }
}

export default Awareness;
