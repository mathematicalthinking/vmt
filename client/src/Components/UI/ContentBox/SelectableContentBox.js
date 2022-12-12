import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Checkbox, ToolTip } from 'Components';
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

  return (
    <Checkbox
      change={onSelect}
      style={{ margin: '0 1rem 0 0' }}
      checked={isChecked}
      dataId={id}
      id={id}
    >
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
              <div
                className={link ? classes.TitleLink : classes.Title}
                data-testid=""
                onClick={() => link && history.push(link)}
                onKeyDown={() => link && history.push(link)}
                role="button"
                tabIndex={-1}
                title={title}
              >
                {link ? (
                  // only show tooltip for lobby link
                  // when the link is provided
                  <ToolTip
                    text={`Go to ${resource.substring(
                      0,
                      resource.length - 1
                    )} lobby`}
                    delay={600}
                  >
                    {title}
                  </ToolTip>
                ) : (
                  title
                )}
              </div>
              {notificationElements}
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
              {customIcons &&
                customIcons.map((icon) => (
                  <div
                    onClick={(e) => icon.onClick(e, id)}
                    onKeyDown={icon.onClick}
                    tabIndex={-1}
                    role="button"
                    key={`icon-${icon.title}-${id}`}
                    style={{ margin: '0 .5rem', cursor: 'pointer' }}
                  >
                    <ToolTip text={icon.title} delay={600}>
                      {icon.icon}
                    </ToolTip>
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
                  <div>Updated: {details.sinceUpdated}</div>
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
                {tabTypesText && tabTypesText.length ? (
                  <div className={classes.TabTypes}>
                    {typeKeyword}: {tabTypesText}
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
  customIcons: PropTypes.arrayOf(PropTypes.shape({})),
  resource: PropTypes.string,
};

SelectableContentBox.defaultProps = {
  notifications: null,
  link: null,
  roomType: null,
  listType: null,
  isChecked: false,
  customIcons: [],
  resource: null,
};

export default SelectableContentBox;
