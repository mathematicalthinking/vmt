import React, { Component } from 'react';
import ContentBox from './ContentBox';
import { DragSource } from 'react-dnd';
import {
  removeCourse,
  removeActivity,
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
    console.log("RESOURCE: ", props.resource)
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
      activitys: (id) => dispatch(removeActivity(id)),
      rooms: (id) => dispatch(removeRoom(id)),
      // member: (id, courseId) => dispatch(removeMember(id, courseId))
    }
  }
}

@connect(null, mapDispatchToProps)
@DragSource(ItemTypes.CARD, cardSource, collect)
class DragBox extends Component {
  render() {
    const { connectDragSource, isDragging } = this.props;
    return connectDragSource(
      <div
        onClick={this.toggleCollapse}
        style={{opacity: isDragging ? 0.5 : 1}}
      >
        <ContentBox {...this.props}  />
      </div>
    )
  }
}

export default DragBox;
