import React, { Component, Fragment } from "react";
import classes from "./roomInfo.css";
import { EditableText } from "../../Components";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ToolTip from "../../Components/ToolTip/ToolTip";
import Expand from "../../Components/UI/ContentBox/expand";

class RoomInfo extends Component {
  state = {
    expanded: true,
    copied: false
  };

  toggleCollapse = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  };

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  copy = () => {
    this.setState({ copied: true }, () => {
      this.timer = setTimeout(() => {
        this.setState({ copied: false });
      }, 5000);
    });
  };

  render() {
    const { role, updatedActivity, room, currentTab } = this.props;
    return (
      <div className={classes.RoomDescription}>
        <div className={classes.TabNameTitle}>
          <EditableText
            owner={role === "facilitator"}
            inputType={"INPUT"}
            resource="tab"
            parentResource={updatedActivity ? "activity" : "room"}
            id={room.tabs[currentTab]._id}
            parentId={room._id}
            field="name"
          >
            {room.tabs[currentTab].name}
          </EditableText>
          <div
            onClick={this.toggleCollapse}
            className={classes.ToggleView}
            style={{
              transform: this.state.expanded ? `rotate(0)` : `rotate(90deg)`
            }}
          >
            <Expand />
          </div>
        </div>
        <div
          className={
            this.state.expanded
              ? classes.InstructionsContainer
              : classes.Collapsed
          }
        >
          <h4 className={classes.InstructionsTitle}>Instructions: </h4>
          {this.props.temp ? (
            <span className={classes.CopiedContainer}>
              Share this link to invite others{" "}
              <CopyToClipboard onCopy={this.copy} text={window.location.href}>
                <div className={classes.CopyRow}>
                  <ToolTip
                    text={
                      this.state.copied
                        ? "copied"
                        : "click this link to copy it to your clipboard"
                    }
                    color={this.state.copied ? "Green" : null}
                  >
                    <span className={classes.LinkContainer}>
                      {window.location.href}
                    </span>
                  </ToolTip>
                  <i className={["fas fa-copy", classes.CopyIcon].join(" ")} />
                </div>
              </CopyToClipboard>
            </span>
          ) : (
            <EditableText
              owner={role === "facilitator"}
              inputType={"TEXT_AREA"}
              resource="tab"
              parentResource={updatedActivity ? "activity" : "room"}
              id={room.tabs[currentTab]._id}
              parentId={room._id}
              field="instructions"
            >
              {room.tabs[currentTab].instructions || room.instructions}
            </EditableText>
          )}
        </div>
      </div>
    );
  }
}

/* <span>
<CopyToClipboard

>
<span>

  <span>
    <ToolTip text="click this link to copy it to your clipboard">
      {window.location.href}
    </ToolTip>
  </span>
</span>
</CopyToClipboard>

</span> */

// </span>

export default RoomInfo;
