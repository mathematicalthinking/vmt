import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import getResourceTabTypes from 'utils/getResourceTabTypes';
import Checkbox from 'Components/Form/Checkbox/Checkbox';
import classes from './contentBox.css';
import Icons from './Icons/Icons';
import Aux from '../../HOC/Auxil';
import Expand from './expand';
import Notification from '../../Notification/Notification';
import { select } from 'd3';

class ContentBox extends PureComponent {
  state = {
    expanded: false,
    typeKeyword: 'Tab Type',
    tabTypes: '',
  };

  componentDidMount() {
    const { roomType } = this.props;

    if (roomType) {
      const { tabTypes, isPlural } = getResourceTabTypes(roomType);
      const tempTypeKeyword = isPlural ? 'Tab Types' : 'Tab Type';
      this.setState({ typeKeyword: tempTypeKeyword, tabTypes });
    }
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
      selected,
      selectOne,
    } = this.props;
    const { expanded, tabTypes, typeKeyword } = this.state;
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

    return (
      <div style={{ display: 'flex' }}>
        {selectable && (
          <Checkbox
            change={selectOne}
            style={{ margin: '0 1rem' }}
            checked={selected.indexOf(id) > -1}
            dataId={id}
            id={id}
          />
        )}

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
        </Link>
      </div>
    );
  }
}

ContentBox.propTypes = {
  id: PropTypes.string.isRequired,
  key: PropTypes.string.isRequired,
  notifications: PropTypes.number,
  link: PropTypes.string.isRequired,
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
  selected: PropTypes.arrayOf(PropTypes.shape({})),
  selectOne: PropTypes.func,
};

ContentBox.defaultProps = {
  notifications: null,
  image: null,
  roomType: null,
  selectable: false,
  selected: [],
  selectOne: null,
};
export default ContentBox;
