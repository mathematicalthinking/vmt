import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classes from './contentBox.css';
import Icons from './Icons/Icons';
import Aux from '../../HOC/Auxil';
import Expand from './expand';

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
    } = this.props;
    const { expanded } = this.state;

    const innerContent = (
      <div
        data-testid={`content-box-${title}`}
        className={classes.SubContainer}
      >
        <div className={classes.TopBanner}>
          <div className={classes.BannerLeft}>
            {resource === 'rooms' ? (
              <div className={classes.Icons}>
                <Icons
                  image={image}
                  lock={locked}
                  roomType={roomType}
                  listType={listType}
                />
              </div>
            ) : null}
            <div className={classes.Title} data-testid="">
              {title} -
              <span className={classes.TimeStamp}>{details.updatedAt}</span>
            </div>
          </div>
          <div
            className={classes.Expand}
            style={{
              transform: expanded ? `rotate(180deg)` : `rotate(0)`,
            }}
          >
            <Expand clickHandler={this.toggleExpand} />
          </div>
        </div>
        <div className={classes.Content}>
          {details && expanded ? (
            <div className={classes.Expanded}>
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
                          {r.name}
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
};

DashboardContentBox.defaultProps = {
  image: null,
  roomType: null,
  link: null,
};
export default DashboardContentBox;
