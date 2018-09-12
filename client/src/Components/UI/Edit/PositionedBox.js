import React, { PureComponent } from 'react';
import classes from './positionedBox.css';
class PositionedBox extends PureComponent {

  // componentDidMount() {
  //   height:
  // }

  render() {
    console.log(this.props.x, this.props.y)
    console.log(classes.Fixed)
    return (
      <div id='' className={classes.Fixed} style={{left: this.props.x + 200, top: this.props.y + 100}}>Hello</div>
    )
  }
}

export default PositionedBox;
