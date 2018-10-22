import React, { PureComponent } from 'react';
import classes from './member.css';
import Avatar from '../Avatar/Avatar';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import Aux from '../../HOC/Auxil';
import RoleDropdown from '../../Form/Dropdown/RoleDropdown';

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
    console.log("NEW ROLE: ", role)
    const { changeRole, info } = this.props;
    this.setState({role, editing: false})
    info.role = role
    console.log(info)
    changeRole(info);
  }

  trash = () => {
    console.log('trashing')
    // REMOVE USER...YOU CAN"T REMOVE CREATOR/OWNER
    this.setState({trashing: false, editing: false})
  }

  stopEditing = () => {
    this.setState({editing: false})
  }

  render() {
    console.log(this.props)
    const { info, owner, grantAccess, notification, resourceName } = this.props;
    return (
      <Aux>
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
          {this.state.editing ? <div className={classes.Trash} onClick={() => this.setState({trashing: true})}><i className="fas fa-trash-alt"></i></div>: null}
    
          {owner && !grantAccess ? <div className={classes.Edit} onClick={this.edit}><i className="fas fa-edit"></i></div> : null}
        </div>
      </div>
      <Modal show={this.state.trashing}>
        <div>
          <div>Are you sure you want to remove {info.user.username} from this {resourceName}?</div>
          <div>
            <Button m={5} click={this.trash}>Yes</Button>
            <Button m={5} click={() => this.setState({trashing: false})}>No</Button>
          </div>
        </div>

      </Modal>
      </Aux>
    )
  }
}

export default Member;
