import React from "react";
import classes from "./workspace.css";

const WorkspaceLayout = React.memo(props => {
  let {
    graph,
    chat,
    tabs,
    bottomRight,
    bottomLeft,
    currentMembers,
    referFromCoords,
    referToCoords,
    graphs,
    replayer,
    currentTab,
    roomName
  } = props;
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
  let chatHeight = "63%";
  let flexB = "0";
  if (!props.chatExpanded) {
    chatHeight = "auto";
    if (props.membersExpanded) {
      membersHeight = "33%";
    }
  }
  // This is annoying but the flexx basis behavior is not consistant across browsers and it is messing up how
  // the right panel elements collapse and expand
  if (typeof InstallTrigger !== "undefined" && props.chatExpanded) {
    // If this is Firefox
    flexB = "auto";
  }
  return (
    <div className={classes.PageContainer}>
      <div className={classes.Container}>
        <h2 className={classes.Title}>{roomName}</h2>
        <div className={classes.Left}>
          <div className={[classes.Top, "graph"].join(" ")}>
            <div className={classes.WorkspaceTabs}>{tabs}</div>
            {!replayer ? (
              <div className={[classes.Graph, "graph"].join(" ")}>
                {" "}
                {/**  "graph" class here is so geogebra applet will scale to container**/}
                {graph}
              </div>
            ) : (
              graphs.map((graph, i) => {
                return (
                  <div
                    key={i}
                    className={[classes.Graph].join(" ")}
                    style={{ display: currentTab === i ? "flex" : "none" }}
                  >
                    {" "}
                    {/**  "graph" class here is so geogebra applet will scale to container**/}
                    {graph}
                  </div>
                );
              })
            )}
          </div>
          <div className={classes.Bottom}>{bottomLeft}</div>
        </div>
        <div className={classes.Right}>
          <div
            className={classes.Chat}
            style={{ height: chatHeight, flexBasis: flexB }}
          >
            {chat}
          </div>
          <div className={classes.Members} style={{ height: membersHeight }}>
            {currentMembers}
          </div>
          <div className={classes.BottomRight}>{bottomRight}</div>
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
});
export default WorkspaceLayout;
