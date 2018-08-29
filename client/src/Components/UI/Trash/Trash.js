import React, { Component } from 'react';
import { connect } from 'react-redux';
import { moveCard } from '../../../store/actions'
import {
  DropTarget,
  // DropTargetMonitor,
  // DropTargetConnector,
  // DropTargetCollector,
  // ConnectDropTarget,
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
    console.log(props)
    console.log(monitor)
    console.log(monitor.cardId)
    props.removeResource()
    // props.moveCard(props.x, props.y);
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }
}

@DropTarget(ItemTypes.CARD, trashTarget, collect)
export default class Trash extends Component {
  render() {
    const { connectDropTarget, isOver } = this.props;
    const activeClass = isOver ? classes.Over : classes.Default;
    return connectDropTarget(
      <div
        className={activeClass}
      ><i class="far fa-trash-alt"></i></div>
    )
  }
}
