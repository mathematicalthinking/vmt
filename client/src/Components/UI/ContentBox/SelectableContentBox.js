import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'Components';
import Notification from 'Components/Notification/Notification';
import getResourceTabTypes from 'utils/getResourceTabTypes';
import Icons from './Icons/Icons';
import Expand from './expand';
import classes from './SelectableContentBox.css';

const SelectableContentBox = (props) => {
  const {
    id,
    notifications,
    link,
    roomType,
    listType,
    title,
    locked,
    details,
    isChecked,
    onSelect,
    customIcons,
  } = props;

  const [expanded, setExpanded] = useState(false);
  const [typeKeyword, setTypeKeyword] = useState('Tab Type');
  const [tabTypes, setTabTypes] = useState('');

  useEffect(() => {
    const { resourceTabTypes, isPlural } = getResourceTabTypes(roomType);
    const tempTypeKeyword = isPlural ? 'Tab Types' : 'Tab Type';
    setTypeKeyword(tempTypeKeyword);
    setTabTypes(resourceTabTypes);
  }, []);

  const notificationElements =
    notifications > 0 ? (
      <Notification count={notifications} data-testid="content-box-ntf" />
    ) : null;

  return (
    <div style={{ display: 'flex' }}>
      <Checkbox
        change={onSelect}
        style={{ margin: '0 1rem' }}
        checked={isChecked}
        dataId={id}
        id={id}
      />
      <div
        to={link}
        className={classes.Container}
        style={{ height: expanded ? 150 : 50, cursor: 'default' }}
      >
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
              <div className={classes.Title} data-testid="">
                {title}
              </div>
              {notificationElements}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                width: '100%',
                padding: '0 1rem',
              }}
            >
              {customIcons &&
                customIcons.map((icon) => (
                  <div
                    onClick={(e) => icon.onClick(e, id)}
                    onKeyDown={icon.onClick}
                    tabIndex={-1}
                    role="button"
                    title={icon.title}
                    key={`icon-${icon.title}-${id}`}
                    style={{ margin: '0 1rem', cursor: 'pointer' }}
                  >
                    {icon.icon}
                  </div>
                ))}
            </div>
            <div
              className={classes.Expand}
              style={{
                transform: expanded ? `rotate(180deg)` : `rotate(0)`,
              }}
            >
              <Expand
                clickHandler={(e) => {
                  e.preventDefault();
                  setExpanded((prevState) => !prevState);
                }}
              />
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
                  <div>Updated: {details.sinceUpdated} ago</div>
                ) : null}
                {details.createdAt ? (
                  <div>Created: {details.createdAt}</div>
                ) : null}
                {details.dueDate ? (
                  <div>Due Date: {details.dueDate}</div>
                ) : null}
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
      </div>
    </div>
  );
};

SelectableContentBox.propTypes = {
  id: PropTypes.string.isRequired,
  notifications: PropTypes.number,
  link: PropTypes.string,
  roomType: PropTypes.string,
  listType: PropTypes.string,
  title: PropTypes.string.isRequired,
  locked: PropTypes.bool.isRequired,
  details: PropTypes.shape({
    facilitators: PropTypes.arrayOf(PropTypes.string),
    sinceUpdated: PropTypes.string,
    createdAt: PropTypes.string,
    dueDate: PropTypes.string,
    creator: PropTypes.string,
    entryCode: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  isChecked: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  customIcons: PropTypes.arrayOf(PropTypes.shape({})),
};

SelectableContentBox.defaultProps = {
  notifications: null,
  link: null,
  roomType: null,
  listType: null,
  isChecked: false,
  customIcons: [],
};

export default SelectableContentBox;
