import React, { PureComponent } from 'react';
import classes from './positionedBox.css';
class PositionedBox extends PureComponent {

  state = {
    left: 0,
    top: 0,
  }

  boxRef = React.createRef();

  componentDidMount() {
    this.setState({
      left: this.props.x - this.boxRef.current.clientWidth,
      top: this.props.y - this.boxRef.current.clientHeight,
    })
  }

  render() {
    console.log(this.props.x, this.props.y)
    console.log(classes.Fixed)
    return (
      <div ref={this.boxRef} className={classes.Fixed} style={{left: this.state.left, top: this.state.top}}>Hello</div>
    )
  }
}

export default PositionedBox;
