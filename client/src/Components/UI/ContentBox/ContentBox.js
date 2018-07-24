// PROPS
  //
import React, { Component } from 'react';
import classes from './contentBox.css'
let alignClass= classes.Center;
class ContentBox extends Component {
  render() {
    if (this.props.align === 'left') alignClass = classes.Left;
    if (this.props.align === 'right') alignClass = classes.Right

    return (
      <div className={classes.Container} onClick={this.toggleCollapse}>
        <div className={classes.Title}>{this.props.title}</div>
        <div className={[classes.Content, alignClass].join(' ')}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default ContentBox;
