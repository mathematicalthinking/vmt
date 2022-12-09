import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Checkbox, ToolTip } from 'Components';
import getResourceTabTypes from 'utils/getResourceTabTypes';
import classes from './contentBox.css';
import Icons from './Icons/Icons';
import Expand from './expand';
import Notification from '../../Notification/Notification';

class ContentBox extends PureComponent {
  state = {
    expanded: false,
    typeKeyword: 'Tab Type',
    tabTypes: '',
  };

  componentDidMount() {
    const { roomType, resource } = this.props;

    if (roomType) {
      const { tabTypes, isPlural } = getResourceTabTypes(roomType);
      const tempTypeKeyword = isPlural ? 'Tab Types' : 'Tab Type';
      this.setState({ typeKeyword: tempTypeKeyword, tabTypes });
    }
    const createResourceToDisplay =
      resource === 'courses' || resource === 'rooms'
        ? resource.substring(0, resource.length - 1)
        : 'template';
    this.setState({ resourceToDisplay: createResourceToDisplay });
  }

  toggleExpand = (event) => {
    event.preventDefault();
    this.setState((prevState) => ({
      expanded: !prevState.expanded,
    }));
  };

  render() {
    const {
      id,
      notifications,
      link,
      image,
      roomType,
      listType,
      title,
      locked,
      details,
      selectable,
      isChecked,
      onSelect,
      customIcons,
    } = this.props;
    const { expanded, tabTypes, typeKeyword, resourceToDisplay } = this.state;
    const notificationElements =
      notifications > 0 ? (
        <Notification count={notifications} data-testid="content-box-ntf" />
      ) : null;
    if (
      roomType &&
      roomType[0] === 'pyret' &&
      window.env.REACT_APP_PYRET_MODE &&
      window.env.REACT_APP_PYRET_MODE.toLowerCase() !== 'yes'
    ) {
      return null;
    }

    const childElements = (
      <div
        data-testid={`content-box-${title}`}
        className={classes.SubContainer}
      >
        <div className={classes.TopBanner}>
          <div className={classes.BannerLeft}>
            <div className={classes.Icons}>
              <Icons
                // image={image}
                lock={locked}
                roomType={roomType}
                listType={listType} // private means the list is displayed in myVMT public means its displayed on /community
              />
            </div>
            <ToolTip text={`Go To ${resourceToDisplay} Lobby`} delay={600}>
              <div className={classes.Title} data-testid="" title={title}>
                {title}
              </div>
            </ToolTip>
          </div>
          <div className={classes.CustomIconContainer}>
            {notificationElements}
            {customIcons &&
              customIcons.map((icon) => (
                <div
                  onClick={(e) => icon.onClick(e, id)}
                  onKeyDown={icon.onClick}
                  tabIndex={-1}
                  role="button"
                  title={icon.title}
                  key={`icon-${icon.title}-${id}`}
                  // style={{ margin: '0 1rem', cursor: 'pointer' }}
                  className={classes.CustomIcon}
                >
                  {icon.icon}
                </div>
              ))}
            <div
              className={classes.Expand}
              style={{
                transform: expanded ? `rotate(180deg)` : `rotate(0)`,
              }}
            >
              <Expand clickHandler={this.toggleExpand} />
            </div>
          </div>
        </div>
        <div className={classes.Content}>
          {details && expanded ? (
            <div className={classes.Expanded}>
              {details.facilitators && details.facilitators.length > 0 ? (
                <div>
                  Facilitators:{' '}
                  {details.facilitators.map((facilitator) => facilitator)}
                </div>
              ) : null}
              {details.sinceUpdated ? (
                <div>Updated: {details.sinceUpdated}</div>
              ) : null}
              {details.createdAt ? (
                <div>Created: {details.createdAt}</div>
              ) : null}
              {details.dueDate ? <div>Due Date: {details.dueDate}</div> : null}
              {details.creator ? `Creator: ${details.creator}` : null}
              {details.entryCode ? (
                <div>Entry Code: {details.entryCode}</div>
              ) : null}
              {details.description ? (
                <div>Description: {details.description}</div>
              ) : null}
              {tabTypes && tabTypes.length ? (
                <div className={classes.TabTypes}>
                  {typeKeyword}: {tabTypes}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );

    const parentElement = link ? (
      <Link
        to={link}
        className={classes.Container}
        style={{ height: expanded ? 150 : 50 }}
      >
        {childElements}
      </Link>
    ) : (
      <div
        to={link}
        className={classes.Container}
        style={{ height: expanded ? 150 : 50, cursor: 'default' }}
      >
        {childElements}
      </div>
    );

    return (
      <div style={{ display: 'flex' }}>
        {selectable && (
          <Checkbox
            change={onSelect}
            style={{ margin: '0 1rem' }}
            checked={isChecked}
            dataId={id}
            id={id}
          />
        )}

        {parentElement}
      </div>
    );
  }
}

ContentBox.propTypes = {
  id: PropTypes.string.isRequired,
  notifications: PropTypes.number,
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
  selectable: PropTypes.bool,
  isChecked: PropTypes.bool,
  onSelect: PropTypes.func,
  customIcons: PropTypes.arrayOf(PropTypes.shape({})),
  resource: PropTypes.string,
};

ContentBox.defaultProps = {
  notifications: null,
  image: null,
  roomType: null,
  selectable: false,
  isChecked: false,
  onSelect: null,
  customIcons: [],
  link: null,
  resource: null,
};
export default ContentBox;
