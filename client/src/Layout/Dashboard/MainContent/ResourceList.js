/* eslint-disable react/no-did-update-set-state */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import BoxList from '../../BoxList/BoxList';
import NewResource from '../../../Containers/Create/NewResource/NewResource';
import classes from './resourceList.css';
import Search from '../../../Components/Search/Search';
// CONSIDER RENAMING TO DASHBOARDCONTENT
class ResourceList extends Component {
  state = {
    participantList: [],
    facilitatorList: [],
  };

  componentDidMount() {
    const { userResources } = this.props;
    const { facilitatorList, participantList } = this.sortUserResources(
      userResources
    );
    this.setState({
      facilitatorList,
      participantList,
    });
  }

  componentDidUpdate(prevProps) {
    const { userResources } = this.props;
    if (prevProps.userResources !== userResources) {
      const { facilitatorList, participantList } = this.sortUserResources(
        userResources
      );
      this.setState({
        facilitatorList,
        participantList,
      });
    }
  }

  search = (criteria) => {
    const { userResources } = this.props;
    let { facilitatorList, participantList } = this.sortUserResources(
      userResources
    );
    facilitatorList = facilitatorList.filter((resource) => {
      return resource.name.indexOf(criteria) > -1;
    });
    participantList = participantList.filter((resource) => {
      return resource.name.indexOf(criteria) > -1;
    });
    this.setState({
      facilitatorList,
      participantList,
    });
  };

  sortUserResources = (resources) => {
    const facilitatorList = [];
    const participantList = [];
    if (resources) {
      resources.forEach((userResource) => {
        if (userResource.myRole === 'facilitator') {
          facilitatorList.push(userResource);
        } else {
          participantList.push(userResource);
        }
      });
    }
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
    const { facilitatorList, participantList } = this.state;
    let linkPath = `/myVMT/${resource}/`;
    let linkSuffix;
    if (resource === 'courses') {
      linkSuffix = '/activities';
    } else {
      linkSuffix = '/details';
    }
    let displayResource = resource[0].toUpperCase() + resource.slice(1);
    if (displayResource === 'Activities') displayResource = 'Templates';
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
            <Search _search={this.search} data-testid="search" />
          </div>
          {create}
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
