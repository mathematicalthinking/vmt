import React, { Component } from 'react';
import classes from './roomInfo.css';
import { EditableText }from '../../Components';
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Expand from '../../Components/UI/ContentBox/expand';

class RoomInfo extends Component {
  state = {
    expanded: true,
    copied: false,
  }
  toggleCollapse = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  copy = () => {
    this.setState({copied: true}, () => {
      setTimeout(() => {
        this.setState({copied: false})
      }, 1000)
    })
  }

  render() {
    const { role, updatedActivity, room, currentTab } = this.props;
    return (
    <div className={classes.RoomDescription}>
      <div className={classes.TabNameTitle} >
        <EditableText owner={role === 'facilitator'} inputType={'INPUT'} resource='tab' parentResource={updatedActivity ? 'activity' : 'room'} id={room.tabs[currentTab]._id}  parentId={room._id} field='name'>
          {room.tabs[currentTab].name}
        </EditableText>
        <div onClick={this.toggleCollapse} className={classes.ToggleView} style={{transform: this.state.expanded ? `rotate(0)` : `rotate(90deg)`}}><Expand/></div>
      </div>
      <div className={(this.state.expanded ? classes.InstructionsContainer : classes.Collapsed)}>
        <h4 className={classes.InstructionsTitle}>Instructions: </h4>
        <EditableText owner={role === 'facilitator'} inputType={'TEXT_AREA'} resource='tab' parentResource={updatedActivity ? 'activity' : 'room'} id={room.tabs[currentTab]._id} parentId={room._id} field='instructions'>
          {this.props.temp
            ? <span className={classes.CopiedContainer}>
                Share this link to invite others
                {this.state.copied ? <p className={classes.Copied}> copied! </p> : null}
                <CopyToClipboard onCopy={this.copy} text={window.location.href}>
                  <i className={["fas fa-copy", classes.CopyIcon].join(" ")}> {window.location.href}</i>
                </CopyToClipboard>
              </span>
            : room.tabs[currentTab].instructions || room.instructions
          }
        </EditableText>
        {this.state.copied ? 'copied!' : null}
      </div>
    </div>
    )
  }
}

export default RoomInfo;