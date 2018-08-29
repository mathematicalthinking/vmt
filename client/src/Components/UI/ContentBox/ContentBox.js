import React, { Component } from 'react';
import classes from './contentBox.css';
import Icons from './Icons/Icons';
import { DragSource } from 'react-dnd';
const ItemTypes = {
  CARD: 'card'
}

const cardSource = {
  beginDrag(props) {
    return {
      cardId: props.key
    };
  }
}

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
})

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
