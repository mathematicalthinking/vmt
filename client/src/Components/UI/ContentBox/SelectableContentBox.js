import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Checkbox, ToolTip, TabTypes } from 'Components';
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
    resource,
    customStyle,
  } = props;

  const history = useHistory();
  const [expanded, setExpanded] = useState(false);
  const [typeKeyword, setTypeKeyword] = useState('Tab Type');
  const [tabTypesText, setTabTypesText] = useState('');

  useEffect(() => {
    const { tabTypes, isPlural } = getResourceTabTypes(roomType);
    const tempTypeKeyword = isPlural ? 'Tab Types' : 'Tab Type';
    setTypeKeyword(tempTypeKeyword);
    setTabTypesText(tabTypes);
  }, []);

  const notificationElements =
    notifications > 0 ? (
      <Notification count={notifications} data-testid="content-box-ntf" />
    ) : null;

  if (roomType && !TabTypes.isActive(roomType)) return null;

  return (
    <Checkbox
      change={onSelect}
      style={{ margin: '0 1rem 0 0', width: '100%' }}
      checked={isChecked}
      dataId={id}
      id={id}
    >
      <div
        to={link}
        className={classes.Container}
        style={{
          height: expanded ? 150 : 50,
          cursor: 'default',
          ...customStyle,
        }}
        data-testid={`SelectableContentBox-container-${title}`}
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
                  // lock={locked}
                  roomType={roomType}
                  listType={listType} // private means the list is displayed in myVMT public means its displayed on /community
                />
              </div>
              <div
                className={link ? classes.TitleLink : classes.Title}
                onClick={() => link && history.push(link)}
                onKeyDown={() => link && history.push(link)}
                role="button"
                tabIndex={-1}
                data-testid={`SelectableContentBox-${title}`}
              >
                <ToolTip text={title} delay={600}>
                  {title}
                </ToolTip>
              </div>
              {/* {notificationElements} */}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                width: '100%',
                // padding: '0 1rem',
              }}
            >
              {notificationElements}
              {customIcons &&
                customIcons.map((icon) => (
                  <div
                    onClick={(e) => icon.onClick(e, id)}
                    onKeyDown={icon.onClick}
                    tabIndex={-1}
                    role="button"
                    key={`icon-${icon.title}-${id}`}
                    style={{ margin: '0 .5rem', cursor: 'pointer' }}
                    data-testid={`${icon.title}-button-${id}`}
                  >
                    {icon.generateIcon ? icon.generateIcon(id) : icon.icon}
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
                  <div className={classes.Facilitators}>
                    <span className={classes.DetailsTitle}>Facilitators: </span>
                    {details.facilitators.map((facilitator) => (
                      <span
                        key={`${facilitator}-${id}`}
                        className={classes.FacilitatorsList}
                      >
                        {facilitator}{' '}
                      </span>
                    ))}
                  </div>
                ) : null}
                {details.sinceUpdated ? (
                  <div className={classes.ExpandedItemContainer}>
                    <span className={classes.DetailsTitle}>Updated: </span>
                    {details.sinceUpdated}
                  </div>
                ) : null}
                {details.createdAt ? (
                  <div className={classes.ExpandedItemContainer}>
                    <span className={classes.DetailsTitle}>Created: </span>
                    {details.createdAt}
                  </div>
                ) : null}
                {details.dueDate ? (
                  <div className={classes.ExpandedItemContainer}>
                    <span className={classes.DetailsTitle}>Due Date: </span>
                    {details.dueDate}
                  </div>
                ) : null}
                {details.creator ? `Creator: ${details.creator}` : null}
                {details.entryCode ? (
                  <div className={classes.ExpandedItemContainer}>
                    <span className={classes.DetailsTitle}>Entry Code: </span>
                    {details.entryCode}
                  </div>
                ) : null}
                {details.description ? (
                  <div className={classes.ExpandedItemContainer}>
                    <span className={classes.DetailsTitle}>Description: </span>
                    {details.description}
                  </div>
                ) : null}
                {tabTypesText && tabTypesText.length ? (
                  <div className={classes.TabTypes}>
                    <span className={classes.DetailsTitle}>
                      {typeKeyword}:{' '}
                    </span>
                    {tabTypesText}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Checkbox>
  );
};

SelectableContentBox.propTypes = {
  id: PropTypes.string.isRequired,
  notifications: PropTypes.number,
  link: PropTypes.string,
  roomType: PropTypes.arrayOf(PropTypes.string),
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
  customIcons: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      onClick: PropTypes.func,
      icon: PropTypes.node,
      generateIcon: PropTypes.func,
    })
  ),
  resource: PropTypes.string,
  customStyle: PropTypes.shape({}),
};

SelectableContentBox.defaultProps = {
  notifications: null,
  link: null,
  roomType: null,
  listType: null,
  isChecked: false,
  customIcons: [],
  resource: null,
  customStyle: null,
};

export default SelectableContentBox;
