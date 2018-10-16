import React, { PureComponent } from 'react';
import classes from './member.css';
import Avatar from '../Avatar/Avatar';
import Button from '../Button/Button';
import Aux from '../../HOC/Auxil';
import PositionedBox from '../Edit/PositionedBox';
import EditMember from './EditMember';
class Member extends PureComponent {

  state = {
    role: this.props.info.role,
    editing: false,
    changing: false,
    x: 0,
    y: 0,
  }

  edit = event => {
    this.setState({
      editing: true,
      x: event.pageX,
      y: event.pageY,
    })
  }

  changeRole = (event) => {
    const { changeRole, info } = this.props;
    this.setState({role: event.target.name, changing: true})
    setTimeout(() => {this.setState({editing: false})}, 500)
    info.role = event.target.name
    changeRole(info);
  }

  stopEditing = () => {
    this.setState({editing: false})
  }

  render() {
    const { info, owner, grantAccess, notification } = this.props;
    return (
      <Aux>
        {this.state.editing ?
          <PositionedBox hide={this.stopEditing} x={this.state.x} y={this.state.y}>
            <EditMember role={this.state.role} changeRole={this.changeRole}/>
          </PositionedBox> : null}
        <div className={classes.Container}>
          <div className={classes.Avatar}><Avatar username={info.user.username} /></div>
          {notification ? <div className={classes.Notification} data-testid="member-ntf">new member</div>: null}
          <div className={classes.Row}>
            {grantAccess ? <Button click={this.props.grantAccess} data-testid='grant-access'>Grant Access</Button> : null}
            <div className={classes.Role}>{info.role}</div>
            {owner && !grantAccess ? <div className={classes.Icon} onClick={this.edit}><i className="fas fa-edit"></i></div> : null}
          </div>
        </div>
      </Aux>
    )
  }
}

export default Member;
