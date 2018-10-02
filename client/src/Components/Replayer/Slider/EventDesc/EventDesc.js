import React, { Component } from 'react'
import classes from './eventDesc.css'
class EventDesc extends Component {

  state = {
    show: false,
  }

  mouseEnter = () => {
    console.log("show this one")
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
    const {entry, offset, description, color} = this.props;
    return (
      <div style={{backgroundColor: color, left: `${offset}%`}} className={classes.Event} onPointerEnter={this.mouseEnter} onPointerOut={this.mouseExit}>
        <div className={classes.EventDetails} style={{left: `calc(${offset}% - 50px)`, display: `${this.state.show ? 'flex' : 'none'}`}}>{entry.description || entry.text}</div>
      </div>
    )
  }
}

export default EventDesc;
