// @TODO Consider moving this Containers/Members

import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import TextInput from 'Components/Form/TextInput/TextInput';
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
      editedUsername: '',
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
    this.setState({ role: newRole });
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

  changeUsername = (e) => {
    const { info, canEditUsername, editUsername } = this.props;
    // if info.role === 'facilitator', then we can't edit the username
    // otherwise, we need to
    if (info.role !== 'facilitator' && canEditUsername) {
      editUsername({
        _id: info.user._id,
        username: info.user.username,
        newUsername: e.target.value,
      });
      this.setState({ editedUsername: e.target.value });
    }
  };

  avatar = () => {
    // if canEditUsername, then we need to render an Input
    // else if canRemove, then we need to render Avatar with the username & a trash icon
    // and if neither, then we need to render Avatar with the username
    const { info, canEditUsername, canRemove, rejectAccess } = this.props;
    const { editedUsername } = this.state;
    if (canEditUsername && info.role !== 'facilitator') {
      return (
        <TextInput
          change={this.changeUsername}
          leftLabel={`${info.user.username}:`}
          name="username"
          value={editedUsername}
          customStyles={{
            container: {
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'row',
              margin: '0 0 0 0',
              padding: '1rem 0',
            },
            leftLabel: {
              margin: 0,
            },
            input: {
              color: 'black',
              marginLeft: '1rem',
            },
          }}
        />
      );
    }
    const username = info.user ? info.user.username : info.username;
    if (canRemove) {
      return (
        <div className={`${classes.CanRemove}`}>
          <div className={classes.FlexRow}>
            <Avatar
              username={username}
              color={
                (info && info.color) ||
                (info.user &&
                  info.user.displayColor &&
                  info.user.displayColor) ||
                null
              }
            />
            {info.user.email && (
              <span className={classes.Email}>{info.user.email}</span>
            )}
          </div>
          <Button m={5} click={rejectAccess} theme="Danger">
            <i className="fas fa-trash-alt" />
          </Button>
        </div>
      );
    }
    return (
      <div className={classes.Avatar}>
        <Avatar
          username={username}
          color={
            (info && info.color) ||
            (info.user && info.user.displayColor && info.user.displayColor) ||
            null
          }
        />
      </div>
    );
  };

  render() {
    const {
      info,
      owner,
      grantAccess,
      rejectAccess,
      notification,
      resourceName,
      canRemove,
      canEditUsername,
    } = this.props;
    const { editing, trashing } = this.state;
    const username = info.user ? info.user.username : info.username;
    if (trashing) window.scrollTo(0, 0);

    return (
      <div data-testid={`member-${username}`}>
        <div
          className={`${
            canRemove ? classes.CanRemoveContainer : classes.Container
          }`}
        >
          {this.avatar()}
          {notification ? (
            <div className={classes.Notification} data-testid="member-ntf">
              new member
            </div>
          ) : null}
          {/* if editing username, turn off changeRole */}
          {!canEditUsername && (
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
              {/* don't display role if called from NewStep1 */}
              {editing && !canRemove ? (
                <div className={classes.DropDownContainer}>
                  <div className={classes.DropDown}>
                    <RoleDropdown
                      selectHandler={this.changeRole}
                      // not just hardcoding the options because we want the users current role to show up first in the lsit
                      list={['facilitator', 'participant', 'guest'].sort(
                        (a) => {
                          if (a === info.role) {
                            return -1;
                          }
                          return 1;
                        }
                      )}
                    />
                  </div>
                </div>
              ) : (
                !canRemove && <div className={classes.Role}>{info.role}</div>
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
          )}
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
  info: PropTypes.shape({
    role: PropTypes.string,
    user: PropTypes.shape({
      _id: PropTypes.string,
      username: PropTypes.string,
      email: PropTypes.string,
      displayColor: PropTypes.string,
    }),
    username: PropTypes.string,
    color: PropTypes.string,
  }).isRequired,
  owner: PropTypes.bool,
  notification: PropTypes.bool,
  resourceName: PropTypes.string.isRequired,
  grantAccess: PropTypes.func,
  rejectAccess: PropTypes.func,
  changeRole: PropTypes.func,
  canRemove: PropTypes.bool,
  removeMember: PropTypes.func,
  canEditUsername: PropTypes.bool,
  editUsername: PropTypes.func,
};

Member.defaultProps = {
  notification: false,
  owner: false,
  grantAccess: null,
  rejectAccess: null,
  changeRole: null,
  removeMember: null,
  canRemove: false,
  canEditUsername: false,
  editUsername: null,
};

export default Member;
