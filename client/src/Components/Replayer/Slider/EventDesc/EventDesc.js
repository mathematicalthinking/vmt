import React, { Component } from 'react'
import classes from './eventDesc.css'
class EventDesc extends Component {

  state = {
    show: false,
  }

  mouseEnter = () => {
    if (!this.props.dragging) {
      this.setState({show: true})
    }
  }

  mouseExit = () => {
    if (!this.props.dragging) {
      this.setState({show: false})
    }
  }

  render() {
    let {entry, offset, color} = this.props;
    let offS = offset > 99 ? `calc(${offset}% - 4px)` : `${offset}%`
    return (
      <div style={{backgroundColor: this.state.show ? '#2D91F2' : color, left: offS}} className={classes.Event} onPointerEnter={this.mouseEnter} onPointerOut={this.mouseExit}>
        <div className={classes.EventDetails} style={{left: `calc(${offset}% - 50px)`, display: `${this.state.show ? 'flex' : 'none'}`}}>{entry.description || entry.text || entry.message}</div>
      </div>
    )
  }
}

export default EventDesc;
