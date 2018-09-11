import React, { PureComponent } from 'react';
import Member from './Member';
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
    removeMemberFrom: {
      room: () => {},
      course: () => {},
      // member: (id, courseId) => dispatch(removeMember(id, courseId))
    }
  }
}

@connect(null, mapDispatchToProps)
@DragSource(ItemTypes.CARD, cardSource, collect)
class DragBox extends PureComponent {
  render() {
    const { connectDragSource, isDragging } = this.props;
    return connectDragSource(
      <div
        onClick={this.toggleCollapse}
        style={{opacity: isDragging ? 0.5 : 1}} // @TODO ADD A CUSTOM DRAG LAYER HERE SO ITS NOT AS WIDE AND CAN BE EASILY PLACED IN THE TRASHCAN
      >
        <Member {...this.props} owner={true} />
      </div>
    )
  }
}

export default DragBox;
