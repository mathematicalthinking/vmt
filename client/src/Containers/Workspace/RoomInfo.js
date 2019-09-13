import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import classes from './roomInfo.css';
import { EditableText } from '../../Components';
import ToolTip from '../../Components/ToolTip/ToolTip';
import Expand from '../../Components/UI/ContentBox/expand';

class RoomInfo extends Component {
  state = {
    expanded: true,
    copied: false,
  };

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  toggleCollapse = () => {
    const { expanded } = this.state;
    this.setState({
      expanded: !expanded,
    });
  };

  copy = () => {
    this.setState({ copied: true }, () => {
      this.timer = setTimeout(() => {
        this.setState({ copied: false });
      }, 5000);
    });
  };

  getCurrentTabFromRoom = (room, currentTabId) => {
    if (!currentTabId || !Array.isArray(room.tabs)) {
      return null;
    }
    const currentTab = room.tabs.filter((tab) => {
      return tab._id === currentTabId;
    })[0];

    return currentTab;
  };

  render() {
    const { role, updatedActivity, room, currentTab, temp } = this.props;
    const { expanded, copied } = this.state;

    // currentTab is Id
    const currentTabObj = this.getCurrentTabFromRoom(room, currentTab);
    const tabDisplayName = currentTabObj ? currentTabObj.name : '';
    const tabDisplayInstructions =
      (currentTabObj && currentTabObj.instructions) || room.instructions;
    return (
      <div className={classes.RoomDescription}>
        <div className={classes.TabNameTitle} data-testid="room-info-tab-name">
          <EditableText
            owner={role === 'facilitator'}
            inputType="INPUT"
            resource="tab"
            parentResource={updatedActivity ? 'activity' : 'room'}
            id={currentTab}
            parentId={room._id}
            field="name"
          >
            {tabDisplayName}
          </EditableText>
          <div
            onClick={this.toggleCollapse}
            onKeyPress={this.toggleCollapse}
            role="button"
            tabIndex="-2"
            className={classes.ToggleView}
            style={{
              transform: expanded ? `rotate(0)` : `rotate(90deg)`,
            }}
          >
            <Expand clickHandler={() => {}} />
          </div>
        </div>
        <div
          className={
            expanded ? classes.InstructionsContainer : classes.Collapsed
          }
          data-testid="instructions-container"
        >
          <h4 className={classes.InstructionsTitle}>Instructions: </h4>
          {temp ? (
            <span className={classes.CopiedContainer}>
              Share this link to invite others{' '}
              <CopyToClipboard onCopy={this.copy} text={window.location.href}>
                <div className={classes.CopyRow}>
                  <ToolTip
                    text={
                      copied
                        ? 'copied'
                        : 'click this link to copy it to your clipboard'
                    }
                    color={copied ? 'Green' : null}
                  >
                    <span className={classes.LinkContainer}>
                      {window.location.href}
                    </span>
                  </ToolTip>
                  <i className={['fas fa-copy', classes.CopyIcon].join(' ')} />
                </div>
              </CopyToClipboard>
            </span>
          ) : (
            <EditableText
              owner={role === 'facilitator'}
              inputType="TEXT_AREA"
              resource="tab"
              parentResource={updatedActivity ? 'activity' : 'room'}
              id={currentTab}
              parentId={room._id}
              field="instructions"
            >
              {tabDisplayInstructions}
            </EditableText>
          )}
        </div>
      </div>
    );
  }
}

RoomInfo.propTypes = {
  role: PropTypes.string.isRequired,
  updatedActivity: PropTypes.func,
  room: PropTypes.shape({}).isRequired,
  currentTab: PropTypes.string.isRequired, // TODO add custom propType for objectId HexString
  temp: PropTypes.bool.isRequired,
};

RoomInfo.defaultProps = {
  updatedActivity: null,
};
export default RoomInfo;
