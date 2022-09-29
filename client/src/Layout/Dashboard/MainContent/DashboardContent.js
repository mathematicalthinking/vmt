/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MonitoringView } from 'Containers';
import { useDispatch, useStore } from 'react-redux';
import { updateResourceListState } from 'store/actions/user';
import ResourceList from './ResourceList';

export default function DashboardContent(props) {
  const { resource, context } = props;

  // create a state for Rooms, Courses, Activity, & other possible Resources
  // pass it to ResourceList w/a function to update the state
  const resourceStates = useStore().getState().user.resourceListState;
  const [resourceState, setResourceState] = useState(
    (resourceStates && resourceStates[context]) || {}
  );

  // ref that mirrors the resourceState so that we can return it on unmount
  // cf. https://stackoverflow.com/a/65840250/14894260
  const returnState = React.useRef({});
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(updateResourceListState(context, returnState.current));
    };
  }, []);

  const updateResourceState = (newState) => {
    const update = {
      ...resourceState,
      [resource]: newState,
      // ex: course: facilitatorConfig: { key: 'updatedAt', direction: 'ascending' }, participantConfig: { key: 'updatedAt', direction: 'ascending' },
    };
    setResourceState(update);
    // normally set state functions should be pure, without side effects, so the updating of
    // returnState would be in a useEffect. However, in this case, our update function needs to
    // rework its argument, so I'm ok with updating returnState here.
    returnState.current = update;
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
  context: PropTypes.string.isRequired,
};
