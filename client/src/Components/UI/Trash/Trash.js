import React, { Component } from 'react';
import {
  DropTarget,
  DropTargetMonitor,
  DropTargetConnector,
  DropTargetCollector,
  ConnectDropTarget,
} from 'react-dnd';
import classes from './trash.css';

// NB This mirrors the ItemTypes in the ContentBox Component
// if we start adding a bunch more components we need to make a separate directory
// to store these types...if we just have one draggable components this will be finesure thin
const ItemTypes = {
  CARD: 'card',
}
const trashTarget = {
  drop(props, monitor) {
    moveCard(props.x, props.y);
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }
}

// const collect: DropTargetCollector<CollectedProps> = (
//   connect: DropTargetConnector,
//   monitor: DropTargetMonitor,
// ) => ({
//   connectDropTarget: connect.dropTarget(),
//   isOver: !!monitor.isOver(),
//   canDrop: !!monitor.canDrop(),
// })

@DropTarget(ItemTypes.CARD, trashTarget, collect)
export default class Trash extends Component {
  render() {
    const { x, y, connectDropTarget, isOver } = this.props;
    return connectDropTarget(
      <div
        className={classes.Trash}
        style={{fontSize: isOver ? '4em' : '3em'}}
      ><i class="far fa-trash-alt"></i></div>
    )
  }
}
