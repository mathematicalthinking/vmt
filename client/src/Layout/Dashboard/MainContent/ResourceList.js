/* eslint-disable react/no-did-update-set-state */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import BoxList from '../../BoxList/BoxList';
import NewResource from '../../../Containers/Create/NewResource/NewResource';
import classes from './resourceList.css';
import Search from '../../../Components/Search/Search';
import { RadioBtn, InfoBox } from '../../../Components';
// CONSIDER RENAMING TO DASHBOARDCONTENT
class ResourceList extends Component {
  state = {
    participantList: [],
    facilitatorList: [],
    roomStatus: 'default',
  };

  componentDidMount() {
    this.filterByRoomStatus('default');
  }

  componentDidUpdate(prevProps) {
    const { userResources } = this.props;
    if (prevProps.userResources !== userResources) {
      const { roomStatus } = this.state;
      this.filterByRoomStatus(roomStatus);
    }
  }

  search = (criteria, roomStatus) => {
    const { userResources, resource } = this.props;
    let { facilitatorList, participantList } = this.sortUserResources(
      userResources
    );
    console.log(JSON.stringify(facilitatorList));
    const isArchived = roomStatus === 'isArchived';
    const isTrashed = roomStatus === 'isTrashed';
    const noStateFilter = resource !== 'rooms';
    facilitatorList = facilitatorList.filter((rec) => {
      return (
        rec.name.indexOf(criteria) > -1 &&
        (noStateFilter ||
          (rec.isArchived === isArchived && rec.isTrashed === isTrashed))
      );
    });
    participantList = participantList.filter((rec) => {
      return (
        rec.name.indexOf(criteria) > -1 &&
        (noStateFilter ||
          (rec.isArchived === isArchived && rec.isTrashed === isTrashed))
      );
    });
    this.setState({
      facilitatorList,
      participantList,
    });
  };

  filterByRoomStatus = (status) => {
    const allowedRoomStatus = ['default', 'isArchived', 'isTrashed'];
    let { roomStatus } = this.state;
    if (allowedRoomStatus.indexOf(status) > -1) {
      roomStatus = status;
    }
    this.setState({
      roomStatus,
    });
    this.search('', roomStatus);
  };

  sortUserResources = (resources) => {
    const facilitatorList = [];
    const participantList = [];
    resources.forEach((userResource) => {
      if (userResource.myRole === 'facilitator') {
        facilitatorList.push(userResource);
      } else {
        participantList.push(userResource);
      }
    });
    return {
      facilitatorList,
      participantList,
    };
  };

  render() {
    const {
      resource,
      parentResource,
      parentResourceId,
      user,
      notifications,
    } = this.props;
    const { facilitatorList, participantList, roomStatus } = this.state;
    let linkPath = `/myVMT/${resource}/`;
    let linkSuffix;
    if (resource === 'courses') {
      linkSuffix = '/activities';
    } else {
      linkSuffix = '/details';
    }
    const displayResource = resource[0].toUpperCase() + resource.slice(1);
    if (parentResource === 'courses') {
      linkPath = `/myVMT/${parentResource}/${parentResourceId}/${resource}/`;
      linkSuffix = '/details';
    }

    let create;
    if (parentResource !== 'activities' && user.accountType === 'facilitator') {
      // THIS SHOULD ACTUALLY CHANGE DEPENDING ON states CURRENT ROLE ?? MAYBE
      create = (
        <NewResource
          resource={resource}
          courseId={parentResource === 'courses' ? parentResourceId : null}
        />
      );
    }
    /** consider storing a field like myRole on the actual resource in the store...we could compute this when its added to the store and then never again
     * I feel like we are checking roles...which requires looping through the resources members each time.
     */

    return (
      <div>
        {/* @TODO don't show create optinos for participants */}
        <div className={classes.Controls}>
          <div className={classes.Search}>
            <Search
              _search={this.search}
              data-testid="search"
              roomStatus={roomStatus}
            />
          </div>
          {create}
        </div>
        <div className={classes.Filters}>
          {resource === 'rooms' ? (
            <InfoBox title="Room Status" icon={<i className="fas fa-filter" />}>
              <div className={classes.FilterOpts}>
                <RadioBtn
                  data-testid="all-roomStatus-filter"
                  check={() => this.filterByRoomStatus('default')}
                  checked={roomStatus === 'default'}
                  name="Default-roomStatus"
                >
                  Active
                </RadioBtn>
                <RadioBtn
                  data-testid="archived-roomStatus-filter"
                  check={() => this.filterByRoomStatus('isArchived')}
                  checked={roomStatus === 'isArchived'}
                  name="isArchived"
                >
                  Archived
                </RadioBtn>
              </div>
            </InfoBox>
          ) : null}
        </div>
        {facilitatorList.length > 0 && participantList.length > 0 ? (
          <div className={classes.Row}>
            <div className={classes.Col}>
              <h2 className={classes.ResourceHeader}>
                {displayResource} I Manage
              </h2>
              <BoxList
                list={facilitatorList}
                linkPath={linkPath}
                linkSuffix={linkSuffix}
                notifications={notifications}
                resource={resource}
                listType="private"
                parentResourec={parentResource}
                // draggable
              />
            </div>
            <div className={classes.Col}>
              <h2 className={classes.ResourceHeader}>
                {displayResource} I&#39;m a member of
              </h2>
              <BoxList
                list={participantList}
                linkPath={linkPath}
                linkSuffix={linkSuffix}
                notifications={notifications}
                resource={resource}
                listType="private"
                parentResourec={parentResource}
                // draggable
              />
            </div>
          </div>
        ) : (
          <Fragment>
            <h2 className={classes.ResourceHeader}>My {displayResource}</h2>
            <BoxList
              list={facilitatorList.concat(participantList)}
              linkPath={linkPath}
              linkSuffix={linkSuffix}
              notifications={notifications}
              resource={resource}
              listType="private"
              parentResourec={parentResource}
              // draggable
            />
          </Fragment>
        )}
      </div>
    );
  }
}

ResourceList.propTypes = {
  resource: PropTypes.string.isRequired,
  parentResource: PropTypes.string,
  parentResourceId: PropTypes.string,
  user: PropTypes.shape({}).isRequired,
  userResources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

ResourceList.defaultProps = {
  parentResource: null,
  parentResourceId: null,
};

export default ResourceList;
