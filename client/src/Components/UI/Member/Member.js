// @TODO Consider moving this Containers/Members

import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
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
  constructor(props) {
    super(props);
    const { info } = this.props;
    this.state = {
      role: info.role,
      editing: false,
      trashing: false,
    };
  }

  edit = () => {
    this.setState((prevState) => ({
      editing: !prevState.editing,
    }));
  };

  changeRole = (newRole) => {
    const { role } = this.state;
    if (newRole === role) return;
    const { changeRole, info } = this.props;
    this.setState({ editing: false });
    info.role = newRole;
    changeRole(info);
  };

  trash = () => {
    // DONT ALLOW REMOVING CREATOR
    const { info, removeMember } = this.props;
    removeMember(info);
    this.setState({ trashing: false, editing: false });
  };

  stopEditing = () => {
    this.setState({ editing: false });
  };

  render() {
    const {
      info,
      owner,
      grantAccess,
      rejectAccess,
      notification,
      resourceName,
    } = this.props;
    const { editing, trashing } = this.state;
    const username = info.user ? info.user.username : info.username;
    return (
      <div data-testid={`member-${username}`}>
        <div className={classes.Container}>
          <div className={classes.Avatar}>
            <Avatar username={username} color={info.color} />
          </div>
          {notification ? (
            <div className={classes.Notification} data-testid="member-ntf">
              new member
            </div>
          ) : null}
          <div className={classes.Row}>
            {grantAccess ? (
              <Fragment>
                <Button
                  theme="Small"
                  m={5}
                  click={grantAccess}
                  data-testid={`grant-access-${username}`}
                >
                  Grant Access
                </Button>
                <Button m={5} click={rejectAccess} theme="Danger">
                  <i className="fas fa-trash-alt" />
                </Button>
              </Fragment>
            ) : null}
            {editing ? (
              <div className={classes.DropDownContainer}>
                <div className={classes.DropDown}>
                  <RoleDropdown
                    selectHandler={this.changeRole}
                    // not just hardcoding the options because we want the users current role to show up first in the lsit
                    list={['facilitator', 'participant', 'guest'].sort((a) => {
                      if (a === info.role) {
                        return -1;
                      }
                      return 1;
                    })}
                  />
                </div>
              </div>
            ) : (
              <div className={classes.Role}>{info.role}</div>
            )}
            {editing ? (
              <div
                className={classes.Trash}
                onClick={() => this.setState({ trashing: true })}
                onKeyPress={() => this.setState({ trashing: true })}
                role="button"
                tabIndex="-1"
                data-testid="trash-member"
              >
                <i className="fas fa-trash-alt" />
              </div>
            ) : null}

            {owner && !grantAccess ? (
              <div
                className={classes.Edit}
                onClick={this.edit}
                onKeyPress={this.edit}
                data-testid="edit-member"
                role="button"
                tabIndex="-2"
              >
                <i className="fas fa-edit" />
              </div>
            ) : null}
          </div>
        </div>
        <Modal
          show={trashing}
          closeModal={() => this.setState({ trashing: false })}
        >
          <div>
            <div>
              Are you sure you want to remove {username} from this{' '}
              {resourceName}?
            </div>
            <div>
              <Button
                theme="Small"
                m={5}
                click={this.trash}
                data-testid="confirm-trash"
              >
                Yes
              </Button>
              <Button
                theme="SmallCancel"
                m={5}
                click={() => this.setState({ trashing: false })}
              >
                No
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

// Consider adding a listType prop that speicifes if this member is showing up in a classList or a requestAccess list
// and then conditionally require the access vs edit function isntead of just blindly not requiring any of them
Member.propTypes = {
  info: PropTypes.shape({}).isRequired,
  changeRole: PropTypes.func,
  removeMember: PropTypes.func,
  owner: PropTypes.bool,
  grantAccess: PropTypes.func,
  rejectAccess: PropTypes.func,
  notification: PropTypes.bool,
  resourceName: PropTypes.string.isRequired,
};

Member.defaultProps = {
  notification: false,
  owner: false,
  changeRole: null,
  removeMember: null,
  grantAccess: null,
  rejectAccess: null,
};

export default Member;
