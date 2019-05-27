import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classes from './contentBox.css';
import Icons from './Icons/Icons';
import Aux from '../../HOC/Auxil';
import Expand from './expand';
import Notification from '../../Notification/Notification';

class ContentBox extends PureComponent {
  state = {
    expanded: false,
  };

  toggleExpand = event => {
    event.preventDefault();
    this.setState(prevState => ({
      expanded: !prevState,
    }));
  };

  render() {
    const {
      notifications,
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
    const notificationElements =
      notifications > 0 ? (
        <Notification count={notifications} dat-testid="content-box-ntf" />
      ) : null;
    return (
      <Aux>
        <Link
          to={link}
          className={classes.Container}
          style={{ height: expanded ? 150 : 50 }}
        >
          <div
            data-testid={`content-box-${title}`}
            className={classes.SubContainer}
          >
            <div className={classes.TopBanner}>
              <div className={classes.BannerLeft}>
                <div className={classes.Icons}>
                  <Icons
                    image={image}
                    lock={locked}
                    roomType={roomType}
                    listType={listType} // private means the list is displayed in myVMT public means its displayed on /community
                  />
                </div>
                <div className={classes.Title} data-testid="">
                  {title}
                </div>
                {notificationElements}
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
                  <div>{details.description || ''}</div>
                  {details.facilitators && details.facilitators.length > 0 ? (
                    <div>
                      Facilitators:{' '}
                      {details.facilitators.map(facilitator => facilitator)}
                    </div>
                  ) : null}
                  {details.creator ? `Creator: ${details.creator}` : null}
                  {details.entryCode ? (
                    <div>Entry Code: {details.entryCode}</div>
                  ) : (
                    resource
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </Link>
      </Aux>
    );
  }
}

ContentBox.propTypes = {
  notifications: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  roomType: PropTypes.string.isRequired,
  listType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  locked: PropTypes.bool.isRequired,
  details: PropTypes.shape({}).isRequired,
  resource: PropTypes.string.isRequired,
};
export default ContentBox;
