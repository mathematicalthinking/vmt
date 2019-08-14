import React, { PureComponent } from 'react';
import clickOutside from 'react-click-outside';
import classes from './positionedBox.css';

class PositionedBox extends PureComponent {
  state = {
    left: 0,
    top: 0,
  };

  boxRef = React.createRef();

  componentDidMount() {
    this.setState({
      left: this.props.x - this.boxRef.current.clientWidth,
      top: this.props.y - this.boxRef.current.clientHeight,
    });
  }
  handleClickOutside() {
    this.props.hide();
  }

  render() {
    return (
      <div
        ref={this.boxRef}
        className={classes.Fixed}
        style={{ left: this.state.left, top: this.state.top }}
      >
        {this.props.children}
      </div>
    );
  }
}

export default clickOutside(PositionedBox);
