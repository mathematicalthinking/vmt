import React, { Component } from "react";
import classes from "./workspace.css";

class WorkspaceLayout extends Component {
  Graph = React.createRef();

  componentDidUpdate(prevProps) {
    if (this.props.isFullscreen && !prevProps.isFullscreen) {
      this.Graph.current.requestFullscreen();
    } else if (!this.props.isFullscreen && prevProps.isFullscreen) {
      document.exitFullscreen();
    }
  }

  render() {
    let {
      graph,
      chat,
      tabs,
      bottomRight, // rename to tools
      bottomLeft,
      currentMembers,
      referFromCoords,
      referToCoords,
      graphs,
      replayer,
      currentTab,
      roomName,
      loaded,
      isFullscreen
    } = this.props;
    // Set text for taking control button based on current control
    // let controlText = 'Take Control';
    // let inControl = false;
    // if (room.controlledBy === user._id) {
    //   controlText = 'Release Control';
    //   inControl = true;
    // }
    // else if (room.controlledBy) controlText = 'Request Control';

    // let bottomButton;
    // if (role === 'facilitator' && !activityWorkspace) {
    //     bottomButton = <div><Button click={setStartingPoint}>Set starting point</Button></div>
    // } else if (role === 'participant' && activityWorkspace) {
    //   bottomButton = <div><Button click={copyActivity}>Add To My Activities</Button></div>
    // }
    let membersHeight = "auto";
    let chatHeight = "43%";
    let flexB = "0";
    if (!this.props.chatExpanded) {
      chatHeight = "auto";
      if (this.props.membersExpanded) {
        membersHeight = "33%";
      }
    }
    // This is annoying but the flexx basis behavior is not consistant across browsers and it is messing up how
    // the right panel elements collapse and expand....there's gotta be a better way to do this
    if (typeof InstallTrigger !== "undefined" && this.props.chatExpanded) {
      // If this is Firefox
      flexB = "auto";
    }
    return (
      <div
        className={classes.PageContainer}
        style={{ visibility: loaded ? "visible" : "hidden" }}
      >
        <div className={classes.Background} />
        <div className={classes.Container}>
          <div className={classes.Left}>
            <div className={classes.WorkspaceTabs}>{tabs}</div>
            <div
              ref={this.Graph}
              className={[
                replayer ? classes.ReplayerTop : classes.Top,
                "graph"
              ].join(" ")}
              style={{ position: "relative", overflow: "hidden" }}
            >
              {graphs.map((graph, i) => {
                return (
                  <div
                    key={i}
                    className={replayer ? classes.ReplayerGraph : classes.Graph}
                    style={{
                      zIndex: currentTab === i ? 100 : 0,
                      display: "flex",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0
                    }}
                  >
                    {/**  "graph" class here is so geogebra applet will scale to container**/}
                    {graph}
                  </div>
                );
              })}
              {replayer ? (
                <div className={classes.ReplayerBottom}>{bottomLeft}</div>
              ) : null}
            </div>
            {!replayer ? (
              <div className={classes.Bottom}>{bottomLeft}</div>
            ) : null}
          </div>
          <div className={classes.Right}>
            <h2 className={classes.Title}>{roomName}</h2>
            <div
              className={classes.Chat}
              style={{ height: chatHeight, flexBasis: flexB }}
            >
              {chat}
            </div>
            <div className={classes.Tools}>{bottomRight}</div>
            <div className={classes.Members} style={{ height: membersHeight }}>
              {currentMembers}
            </div>
          </div>
        </div>
        {referToCoords && referFromCoords ? (
          <div className={classes.ReferenceLine}>
            <svg height="100%" width="100%" style={{ zIndex: 1 }}>
              <line
                style={{ zIndex: 1500 }}
                x1={referToCoords.left}
                y1={referToCoords.top}
                x2={referFromCoords.left}
                y2={referFromCoords.top}
                stroke="#2D91F2"
                strokeWidth="3"
              />
            </svg>
          </div>
        ) : null}
      </div>
    );
  }
}
export default WorkspaceLayout;
