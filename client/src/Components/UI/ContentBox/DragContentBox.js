import React, { Component } from 'react';
import classes from './contentBox.css';
import Icons from './Icons/Icons';
import { DragSource } from 'react-dnd';
import {
  removeCourse,
  removeAssignment,
  removeRoom,
  // removeMember,
} from '../../../store/actions';
import { connect } from 'react-redux';
const ItemTypes = {
  CARD: 'card'
}

const cardSource = {
  beginDrag(props) {
    return {
      cardId: props.id
    };
  },
  endDrag(props, monitor){
    console.log(props)
    if (monitor.getDropResult()) {
      props.remove[props.resource](props.id);
    }
  }
}

const collect = (connect, monitor) => {
  return {
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}}

const mapDispatchToProps = dispatch => {
  return {
    remove: {
      courses: (id) => dispatch(removeCourse(id)),
      assignments: (id) => dispatch(removeAssignment(id)),
      rooms: (id) => dispatch(removeRoom(id)),
      // member: (id, courseId) => dispatch(removeMember(id, courseId))
    }
  }
}

@connect(null, mapDispatchToProps)
@DragSource(ItemTypes.CARD, cardSource, collect)
class ContentBox extends Component {
  render() {
    const { connectDragSource, isDragging } = this.props;
    let alignClass = classes.Center;
    if (this.props.align === 'left') alignClass = classes.Left;
    if (this.props.align === 'right') alignClass = classes.Right;
    const notifications = (this.props.notifications > 0) ? <div className={classes.Notification}>{this.props.notifications}</div> : null;

    return connectDragSource(
      <div
        className={classes.Container}
        onClick={this.toggleCollapse}
        style={{opacity: isDragging ? 0.5 : 1}}
      >
        <div className={classes.Icons}><Icons lock={this.props.locked} roomType={this.props.roomType}/></div>
        {notifications}
        <div className={classes.Title}>{this.props.title}</div>
        <div className={[classes.Content, alignClass].join(' ')}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default ContentBox;
