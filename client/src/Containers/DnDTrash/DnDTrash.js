import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Aux from '../../Components/HOC/Auxil';
import Trash from '../../Components/UI/Trash/Trash';
import { removeCourse } from '../../store/actions';
const mapDispatchToProps = dispatch => ({
  removeResource: (resource, id) => dispatch(removeCourse(resource, id))
})

@DragDropContext(HTML5Backend, { window })
@connect(null, mapDispatchToProps)
export default class DnD extends Component{
  render() {
    return (
      <Aux>
        {this.props.children}
        <Trash removeResource={this.props.removeResource}/>
      </Aux>
    )
  }
}
