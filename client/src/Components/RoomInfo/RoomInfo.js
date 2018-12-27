import React, { Component } from 'react';
import classes from './roomInfo.css';
import { EditableText }from '../../Components';
import Expand from '..//../Components/UI/ContentBox/expand.js';

class RoomInfo extends Component {
  constructor() {
    super();
    this.state = {
      expanded: true
    }
  }
   toggleCollapse() {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  render() {
    const { role, updatedActivity, room, currentTab } = this.props;
    return (
    <div className={classes.RoomDescription}>
      <div className={classes.TabNameTitle} >
        <EditableText owner={role === 'facilitator'} inputType={'INPUT'} resource='tab' parentResource={updatedActivity ? 'activity' : 'room'} id={room.tabs[currentTab]._id}  parentId={room._id} field='name'>
          {room.tabs[currentTab].name}
        </EditableText>
        <div onClick={this.toggleCollapse.bind(this)} className={classes.ToggleView} style={{transform: this.state.expanded ? `rotate(0)` : `rotate(90deg)`}}><Expand/></div>
      </div>
      <div className={(this.state.expanded ? classes.InstructionsContainer : classes.Collapsed)}>
        <h4 className={classes.InstructionsTitle}>Instructions: </h4>
        <EditableText owner={role === 'facilitator'} inputType={'TEXT_AREA'} resource='tab' parentResource={updatedActivity ? 'activity' : 'room'} id={room.tabs[currentTab]._id} parentId={room._id} field='instructions'>
          {room.tabs[currentTab].instructions || room.instructions}
        </EditableText>
      </div>
    </div>
    )
  }
}

export default RoomInfo;