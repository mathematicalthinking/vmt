/* eslint-disable prettier/prettier */
import React from 'react';
import PropTypes from 'prop-types';
import { MonitoringView } from '../../../Containers';
import ResourceList from './ResourceList';

export default function DashboardContent(props) {
  const { resource } = props;
  // Resource could be rooms, courses, activities, or monitoring. I'm breaking the consitency here as "Monitoring"
  // isn't a resource, but a different way of viewing rooms. Also, I should NOT have a literal string written here.
  // Instead, we could have the resource types (and how they should appear to the user) be among the constants.
  return resource === 'monitoring' ? (
    <MonitoringView {...props} />
  ) : (
    <ResourceList {...props} />
  );
}

DashboardContent.propTypes = {
  resource: PropTypes.string.isRequired,
};
