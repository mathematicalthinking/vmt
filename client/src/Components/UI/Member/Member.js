import React, { PureComponent } from 'react';
import classes from './member.css';
import Avatar from '../Avatar/Avatar';
class Member extends PureComponent {

  state = {
    role: this.props.info.role,
  }

  render() {
    const { info, owner } = this.props;
    return (
      <div className={classes.Container}>
        <div style={{margin: 20}}><Avatar username={info.user.username} /></div>
        <div className={classes.Row}>
          <div className={classes.Role}>{info.role}</div>
          {owner ? <div className={classes.Icon}><i className="fas fa-edit"></i></div> : null}
        </div>
      </div>
    )
  }
}

export default Member;
