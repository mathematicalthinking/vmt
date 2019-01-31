// @TODO Consider moving this Containers/Members

import React, { PureComponent } from 'react';
import classes from './member.css';
import Avatar from '../Avatar/Avatar';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
// import Aux from '../../HOC/Auxil';
import RoleDropdown from '../../Form/Dropdown/RoleDropdown';
// import { userInfo } from 'os';
// import { removeUserActivities } from '../../../store/actions';
// import { removeRoomMember } from '../../../store/actions/rooms';

class Member extends PureComponent {

  state = {
    role: this.props.info.role,
    editing: false,
    trashing: false,
  }

  edit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing,
    }))
  }

  changeRole = (role) => {
    if (role === this.state.role) return;
    let { changeRole, info } = this.props;
    this.setState({role, editing: false})
    info.role = role
    changeRole(info);
  }

  trash = () => {
    // DONT ALLOW REMOVING CREATOR
    let { info, removeMember } = this.props;
    removeMember(info)
    this.setState({trashing: false, editing: false})
  }

  stopEditing = () => {
    this.setState({editing: false})
  }

  render() {
    const { info, owner, grantAccess, notification, resourceName } = this.props;
    let username = info.user ? info.user.username : info.username;
    return (
      <div data-testid={`member-${username}`}>
        <div className={classes.Container}>
          <div className={classes.Avatar}><Avatar username={username} /></div>
          {notification ? <div className={classes.Notification} data-testid="member-ntf">new member</div>: null}
          <div className={classes.Row}>
            {grantAccess ? <Button theme={'Small'} m={5} click={this.props.grantAccess} data-testid={`grant-access-${username}`}>Grant Access</Button> : null}
            {this.state.editing ?
              <div className={classes.DropDown}>
                <RoleDropdown selectHandler={this.changeRole} list={[info.role, (info.role === 'participant') ? 'facilitator' : 'participant']}/>
              </div>:
              <div className={classes.Role}>{info.role}</div>}
            {this.state.editing ? <div className={classes.Trash} onClick={() => this.setState({trashing: true})} data-testid={'trash-member'}><i className="fas fa-trash-alt"></i></div>: null}

            {owner && !grantAccess ? <div className={classes.Edit} onClick={this.edit} data-testid='edit-member'><i className="fas fa-edit"></i></div> : null}
          </div>
        </div>
        <Modal show={this.state.trashing} closeModal={() => this.setState({trashing: false})}>
          <div>
            <div>Are you sure you want to remove {username} from this {resourceName}?</div>
            <div>
              <Button theme={'Small'}m={5} click={this.trash} data-testid='confirm-trash'>Yes</Button>
              <Button theme={'SmallCancel'}m={5} click={() => this.setState({trashing: false})}>No</Button>
            </div>
          </div>

        </Modal>
      </div>
    )
  }
}

export default Member;
