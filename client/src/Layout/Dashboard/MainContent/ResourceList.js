import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import BoxList from '../../BoxList/BoxList';
import NewResource from '../../../Containers/Create/NewResource/NewResource';
import classes from './resourceList.css';
// import Search from '../../../Components/Search/Search';
// CONSIDER RENAMING TO DASHBOARDCONTENT
const ResourceList = props => {
  const {
    resource,
    parentResource,
    parentResourceId,
    user,
    userResources,
    notifications,
  } = props;
  let linkPath = `/myVMT/${resource}/`;
  let linkSuffix;
  if (resource === 'courses') {
    linkSuffix = '/activities';
  } else {
    linkSuffix = '/details';
  }
  const displayResource = resource[0].toUpperCase() + resource.slice(1);
  if (parentResource === 'courses') {
    linkPath = `/myVMT/${props.parentResource}/${parentResourceId}/${
      props.resource
    }/`;
    linkSuffix = '/details';
  }

  let create;
  // if (props.resource === 'courses' && props.user.accountType === 'facilitator') {
  //   create = <NewCourse />
  // }
  if (parentResource !== 'activities' && user.accountType === 'facilitator') {
    // THIS SHOULD ACTUALLY CHANGE DEPENDING ON states CURRENT ROLE ?? MAYBE
    create = (
      <NewResource
        resource={props.resource}
        courseId={
          props.parentResource === 'courses' ? props.parentResourceId : null
        }
      />
    );
  }

  const facilitatorList = [];
  const participantList = [];
  /** consider storing a field like myRole on the actual resource in the store...we could compute this when its added to the store and then never again
   * I feel like we are checking roles...which requires looping through the resources members each time.
   */
  userResources.forEach(userResource => {
    if (userResource.myRole === 'facilitator') {
      facilitatorList.push(userResource);
    } else {
      participantList.push(userResource);
    }
  });

  return (
    <div>
      {/* @TODO don't show create optinos for participants */}
      <div className={classes.Controls}>
        <div className={classes.Search}>{/* <Search /> */}</div>
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
            list={userResources}
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
};

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
