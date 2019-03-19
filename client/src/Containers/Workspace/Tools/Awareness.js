import React, { Component } from "react";
// import { Avatar, ToolTip, Aux } from "../../../Components";
import classes from "./tools.css";
import ggbTools from "./GgbIcons/";

class Awareness extends Component {
  state = {
    showToolTip: false
  };
  render() {
    let { lastEvent } = this.props;

    return (
      <div className={classes.AwarenessDesc}>
        {lastEvent.description || lastEvent.text}
        <a
          className={classes.AwarenessIcon}
          onMouseOver={() => this.setState({ showToolTip: true })}
          onMouseOut={() => this.setState({ showToolTip: false })}
        >
          {lastEvent.action === "mode" ? (
            // <ToolTip
            //   visible={this.state.showToolTip}
            //   text={ggbTools[lastEvent.label].name
            //     .toLowerCase()
            //     .replace("_", " ")}
            // >
            <img
              src={ggbTools[lastEvent.label].image}
              height={40}
              href={ggbTools[lastEvent.label].link}
              alt={"tool_icon"}
            />
          ) : // </ToolTip>
          null}
        </a>
      </div>
    );
  }
}

export default Awareness;
