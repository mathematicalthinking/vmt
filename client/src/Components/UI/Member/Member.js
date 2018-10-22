import React, { PureComponent } from 'react';
import classes from './member.css';
import Avatar from '../Avatar/Avatar';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import RoleDropdown from '../../Form/Dropdown/RoleDropdown';

class Member extends PureComponent {

  state = {
    role: this.props.info.role,
    editing: false,
  }

  edit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing,
    }))
  }

  changeRole = (role) => {
    console.log("NEW ROLE: ", role)
    const { changeRole, info } = this.props;
    this.setState({role,})
    info.role = role
    console.log(info)
    // changeRole(info);
  }

  stopEditing = () => {
    this.setState({editing: false})
  }

  render() {
    const { info, owner, grantAccess, notification } = this.props;
    return (
      <div className={classes.Container}>
        <div className={classes.Avatar}><Avatar username={info.user.username} /></div>
        {notification ? <div className={classes.Notification} data-testid="member-ntf">new member</div>: null}
        <div className={classes.Row}>
          {grantAccess ? <Button m={5} click={this.props.grantAccess} data-testid='grant-access'>Grant Access</Button> : null}
          {this.state.editing ? 
            <div className={classes.DropDown}>
              <RoleDropdown selectHandler={this.changeRole} list={[info.role, (info.role === 'participant') ? 'facilitator' : 'participant']}/>  
            </div>: 
            <div className={classes.Role}>{info.role}</div>}
          {this.state.editing ? <div className={classes.Trash}><i className="fas fa-trash-alt"></i></div>: null}
    
          {owner && !grantAccess ? <div className={classes.Edit} onClick={this.edit}><i className="fas fa-edit"></i></div> : null}
        </div>
      </div>
    )
  }
}

export default Member;
