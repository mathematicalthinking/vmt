import React, { Component } from 'react';
import { connect } from 'react-redux';
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
    return {trashed: true};
  }
}

function collect(connect, monitor) {
  // console.log(monitor)
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    dragging: monitor.getItem(),
  }
}

// const mapStateToProps = store => ({
//   dragging: store.trash.dragging,
// })
// @connect(mapStateToProps, null)
@DropTarget(ItemTypes.CARD, trashTarget, collect)
export default class Trash extends Component {
  render() {
    console.log(this.props.dragging)
    const { connectDropTarget, isOver, dragging } = this.props;
    const activeClass = isOver ? classes.Over : classes.Default
    return connectDropTarget(
      <div
        className={activeClass}
        style={{opacity: dragging ? 1 : 0}}
      >
        <i className="far fa-trash-alt"></i>
      </div>
    )
  }
}
