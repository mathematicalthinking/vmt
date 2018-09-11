import React, { PureComponent } from 'react';
import classes from './member.css';
import Avatar from '../Avatar/Avatar';
class Member extends PureComponent {

  render() {
    return (
      <div className={classes.UserRow}>
        <div style={{margin: 20}}><Avatar username={this.props.info.user.username} /></div>
        <div className={classes.Role}>{this.props.info.role}</div>
      </div>
    )
  }
}

export default Member;
