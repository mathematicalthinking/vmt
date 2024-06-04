import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { dateAndTime } from 'utils';
import classes from './dashboardContentBox.css';
import Icons from './Icons/Icons';
import Aux from '../../HOC/Auxil';

class DashboardContentBox extends PureComponent {
  state = {
    expanded: true,
  };

  toggleExpand = (event) => {
    event.preventDefault();
    this.setState((prevState) => ({
      expanded: !prevState.expanded,
    }));
  };

  toggleMoreMenu = (event) => {
    event.preventDefault();
    this.setState((prevState) => ({
      doShowMoreMenu: !prevState.doShowMoreMenu,
    }));
  };

  render() {
    const {
      link,
      image,
      roomType,
      listType,
      title,
      locked,
      details,
      resource,
      manageUser,
      isSelf,
      iconActions,
    } = this.props;
    const { expanded } = this.state;

    const { firstName = '', lastName = '' } = details;
    let fullName;

    if (firstName) {
      fullName = firstName;
    }

    if (lastName) {
      if (fullName) {
        fullName = `${fullName} ${lastName}`;
      } else {
        fullName = lastName;
      }
    }

    const innerContent = (
      <div
        data-testid={`content-box-${title}`}
        className={classes.SubContainer}
      >
        <div className={classes.TopBanner}>
          <div className={classes.BannerLeft}>
            {resource === 'rooms' ? (
              <div className={classes.Icons}>
                <Icons lock={locked} roomType={roomType} listType={listType} />
              </div>
            ) : null}
            <div className={classes.Title} data-testid="">
              {title}
              <span className={classes.TimeStamp}>
                {dateAndTime.toDateTimeString(details.updatedAt)}
              </span>
            </div>
          </div>
          <div className={classes.ActionIconsContainer}>
            {iconActions
              ? iconActions.map((i, ix) => {
                  return (
                    <div
                      key={`action-${i.testid}`}
                      className={classes.ActionIcon}
                      onClick={i.onClick}
                      onKeyDown={i.onClick}
                      data-testid={i.testid}
                      title={i.title}
                      role="button"
                      tabIndex={ix}
                    >
                      <i style={{ color: i.color }} className={i.iconClass} />
                    </div>
                  );
                })
              : null}
            <div
              className={classes.Expand}
              style={{
                transform: expanded ? `rotate(180deg)` : `rotate(0)`,
              }}
              role="button"
              tabIndex={-1}
              onClick={this.toggleExpand}
              onKeyDown={this.toggleExpand}
            >
              <i className="fas fa-chevron-up" />
            </div>
          </div>
        </div>
        <div className={classes.Content}>
          {details && expanded ? (
            <div className={classes.Expanded}>
              {resource === 'users' ? (
                <div>
                  <span className={classes.DashboardLabel}>Name:</span>{' '}
                  {fullName || 'N/A'}
                </div>
              ) : null}
              {resource === 'users' ? (
                <div>
                  <span className={classes.DashboardLabel}>Email:</span>{' '}
                  {details.email || 'N/A'}
                </div>
              ) : null}
              {details.accountType ? (
                <div>
                  <span className={classes.DashboardLabel}>Account Type:</span>{' '}
                  {details.accountType}
                </div>
              ) : null}

              <div>
                <span className={classes.DashboardLabel}>Event Count:</span>{' '}
                {details.eventsCount}
              </div>

              <div>
                <span className={classes.DashboardLabel}>Message Count:</span>{' '}
                {details.messagesCount}
              </div>
              {details.latestIpAddress ? (
                <div>
                  <span className={classes.DashboardLabel}>
                    Latest Ip Address:{' '}
                  </span>
                  {details.latestIpAddress}
                </div>
              ) : null}

              {Array.isArray(details.activeMembers) ? (
                <div>
                  <span className={classes.DashboardLabel}>
                    Active Members:
                  </span>{' '}
                  {details.activeMembers.length > 0 ? (
                    <ul className={classes.DashboardList}>
                      {details.activeMembers.map((m) => (
                        <li className={classes.DashboardListItem} key={m._id}>
                          {m.username}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'No Active Members'
                  )}
                </div>
              ) : null}
              {Array.isArray(details.activeRooms) ? (
                <div>
                  <span className={classes.DashboardLabel}>Active Rooms:</span>{' '}
                  {details.activeRooms.length > 0 ? (
                    <ul>
                      {details.activeRooms.map((r) => (
                        <li className={classes.DashboardListItem} key={r._id}>
                          <Link to={`/myVMT/rooms/${r._id}/details`}>
                            {r.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'No Room Activity'
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );
    if (link) {
      return (
        <Aux>
          <Link to={link} className={classes.Container}>
            {innerContent}
          </Link>
        </Aux>
      );
    }
    return (
      <Aux>
        <div className={classes.Container} style={{ cursor: 'default' }}>
          {innerContent}
        </div>
      </Aux>
    );
  }
}

DashboardContentBox.propTypes = {
  link: PropTypes.string,
  image: PropTypes.string,
  roomType: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  listType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  locked: PropTypes.bool.isRequired,
  details: PropTypes.shape({}).isRequired,
  resource: PropTypes.string.isRequired,
  manageUser: PropTypes.func,
  isSelf: PropTypes.bool.isRequired,
  iconActions: PropTypes.arrayOf(
    PropTypes.shape({
      testId: PropTypes.string,
      onClick: PropTypes.func,
      title: PropTypes.string,
    })
  ),
};

DashboardContentBox.defaultProps = {
  image: null,
  roomType: null,
  link: null,
  manageUser: null,
  iconActions: [],
};
export default DashboardContentBox;
