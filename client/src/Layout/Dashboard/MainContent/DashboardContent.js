/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MonitoringView } from '../../../Containers';
import ResourceList from './ResourceList';

export default function DashboardContent(props) {
  const { resource } = props;

  // create a state for Rooms, Courses, Activity, & other possible Resources
  // pass it to ResourceList w/a function to update the state
  const [resourceState, setResourceState] = useState({});
  const updateResourceState = (newState) => {
    setResourceState({
      ...resourceState,
      [resource]: newState,
      //ex: course: facilitatorConfig: { key: 'updatedAt', direction: 'ascending' }, participantConfig: { key: 'updatedAt', direction: 'ascending' },
    });
  };

  // Resource could be rooms, courses, activities, or monitor. I'm breaking the consitency here as "Monitor"
  // isn't a resource, but a different way of viewing rooms. Also, I should NOT have a literal string written here.
  // Instead, we could have the resource types (and how they should appear to the user) be among the constants.
  return resource === 'monitor' ? (
    <MonitoringView {...props} />
  ) : (
    <ResourceList
      // resourceList={resourceList ? resourceList : userResources}
      resourceState={resourceState[resource]}
      setResourceState={updateResourceState}
      {...props}
    />
  );
}

DashboardContent.propTypes = {
  resource: PropTypes.string.isRequired,
};
