import React, { Fragment, useEffect, useState } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { useSortableData } from 'utils';
import BoxList from '../../BoxList/BoxList';
import NewResource from '../../../Containers/Create/NewResource/NewResource';
import Search from '../../../Components/Search/Search';
import classes from './resourceList.css';

const ResourceList = ({
  resource,
  parentResource,
  parentResourceId,
  user,
  userResources,
  notifications,
  resourceState,
  setResourceState,
}) => {
  const initialConfig = {
    key: 'updatedAt',
    direction: 'descending',
    filter: 'all',
  };
  const [fList, setFacilitatorList] = useState([]);
  const [pList, setParticipantList] = useState([]);

  // Use useSortableData hook to enable user-controlled sorting
  const {
    items: facilitatorItems,
    resetSort: facilitatorRequestSort,
    sortConfig: facilitatorSortConfig,
  } = useSortableData(fList, resourceState.facilitatorConfig || initialConfig);

  const {
    items: participantItems,
    resetSort: participantRequestSort,
    sortConfig: participantSortConfig,
  } = useSortableData(pList, resourceState.participantConfig || initialConfig);

  const keys = [
    { property: 'updatedAt', name: 'Last Updated' },
    { property: 'name', name: 'Name' },
    { property: 'createdAt', name: 'Created Date' },
    { property: 'dueDate', name: 'Due Date' },
  ];

  useEffect(() => {
    const { facilitatorList, participantList } = sortUserResources(
      userResources
    );

    setFacilitatorList(facilitatorList);
    setParticipantList(participantList);

    facilitatorRequestSort(resourceState.facilitatorConfig || initialConfig);
    participantRequestSort(resourceState.participantConfig || initialConfig);
  }, [userResources]);

  useEffect(() => {
    if (setResourceState)
      setResourceState({
        facilitatorConfig: facilitatorSortConfig,
        participantConfig: participantSortConfig,
      });
  }, [facilitatorSortConfig, participantSortConfig]);

  const search = (criteria) => {
    let { facilitatorList, participantList } = sortUserResources(userResources);
    facilitatorList = facilitatorList.filter((res) => {
      return res.name.toLowerCase().indexOf(criteria.toLowerCase()) > -1;
    });
    participantList = participantList.filter((res) => {
      return res.name.toLowerCase().indexOf(criteria.toLowerCase()) > -1;
    });
    setFacilitatorList(facilitatorList);
    setParticipantList(participantList);
  };

  const sortUserResources = (resources) => {
    const facilitatorList = [];
    const participantList = [];
    if (resources) {
      resources.forEach((userResource) => {
        if (userResource) {
          if (userResource.myRole === 'facilitator') {
            facilitatorList.push(userResource);
          } else {
            participantList.push(userResource);
          }
        }
      });
    }
    return {
      facilitatorList,
      participantList,
    };
  };

  let linkPath = `/myVMT/${resource}/`;
  let linkSuffix;
  if (resource === 'courses') {
    linkSuffix = '/rooms';
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
      {/* @TODO don't show create options for participants */}
      <div className={classes.Controls}>
        <div className={classes.Search}>
          <Search _search={search} data-testid="search" />
        </div>
        {create}
      </div>
      {fList.length > 0 && pList.length > 0 ? (
        <div className={classes.Row}>
          <div className={classes.Col}>
            <h2 className={classes.ResourceHeader}>
              {displayResource} I Manage
            </h2>
            {fList.length > 1 && setResourceState && (
              <SortUI
                keys={keys}
                sortFn={facilitatorRequestSort}
                sortConfig={resourceState.facilitatorConfig || initialConfig}
              />
            )}

            <BoxList
              list={facilitatorItems}
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
            {pList.length > 1 && setResourceState && (
              <SortUI
                keys={keys}
                sortFn={participantRequestSort}
                sortConfig={resourceState.participantConfig || initialConfig}
              />
            )}
            <BoxList
              list={participantItems}
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
          {fList.length > 0 || displayResource === 'Templates' ? (
            <h2 className={classes.ResourceHeader}>My {displayResource}</h2>
          ) : (
            <h2 className={classes.ResourceHeader}>
              {displayResource} I&#39;m a member of
            </h2>
          )}
          {(fList.length > 1 || pList.length > 1) && setResourceState && (
            <SortUI
              keys={keys}
              sortFn={
                fList.length > 0 || displayResource === 'Templates'
                  ? facilitatorRequestSort
                  : participantRequestSort
              }
              sortConfig={
                fList.length > 0 || displayResource === 'Templates'
                  ? resourceState.facilitatorConfig || initialConfig
                  : resourceState.participantConfig || initialConfig
              }
            />
          )}
          <BoxList
            list={facilitatorItems.concat(participantItems)}
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
  user: PropTypes.shape({ accountType: PropTypes.string }).isRequired,
  userResources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  resourceState: PropTypes.shape({
    facilitatorConfig: PropTypes.shape({}),
    participantConfig: PropTypes.shape({}),
  }),
  setResourceState: PropTypes.func,
};

ResourceList.defaultProps = {
  parentResource: null,
  parentResourceId: null,
  resourceState: {},
  setResourceState: null,
};

export default ResourceList;

// Currently, SortUI is only used within ResourceList. Hence, why it's here.
const SortUI = ({ keys, sortFn, sortConfig }) => {
  const upArrow = <i className="fas fa-solid fa-arrow-up" />;
  const downArrow = <i className="fas fa-solid fa-arrow-down" />;
  const timeFrameOptions = [
    { label: 'All', value: 'all' },
    { label: 'Last Day', value: 'lastDay' },
    { label: 'Last Week', value: 'lastWeek' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Last Year', value: 'lastYear' },
  ];

  const optionForValue = (value) => {
    return timeFrameOptions.find((opt) => opt.value === value);
  };

  const keyName = (defaultName) => {
    const matchingKey = keys.find((key) => key.property === sortConfig.key);
    return matchingKey ? matchingKey.name : defaultName;
  };

  React.useEffect(() => {
    if (!['updatedAt', 'createdAt', 'dueDate'].includes(sortConfig.key))
      sortFn({ filter: 'all' });
  }, [sortConfig.key]);

  return (
    <div className={classes.SortUIContainer}>
      <label htmlFor="sortTable" className={classes.Label}>
        Sort by:&nbsp;&nbsp;
        <Select
          placeholder="Select..."
          className={classes.Select}
          name="sortUI"
          id="sortTable"
          onChange={(selectedOption) => {
            sortFn({
              key: selectedOption.value,
              direction: sortConfig.direction,
            });
          }}
          value={{
            // eslint-disable-next-line react/prop-types
            label: keyName(keys[0].name),
            // eslint-disable-next-line react/prop-types
            value: sortConfig.key || keys[0].property,
          }}
          options={keys.map((key) => ({
            value: key.property,
            label: key.name,
          }))}
          isSearchable={false}
        />
        <span
          style={{ paddingRight: '5px' }}
          onClick={() => sortFn({ key: sortConfig.key })}
          onKeyDown={() => sortFn({ key: sortConfig.key })}
          role="button"
          tabIndex={-1}
        >
          {sortConfig.direction === 'descending' ? downArrow : upArrow}{' '}
        </span>
      </label>
      {['updatedAt', 'createdAt', 'dueDate'].includes(sortConfig.key) && (
        <label htmlFor="filterTable" className={classes.Label}>
          Filter by:
          <Select
            placeholder="Timeframe"
            className={classes.Select}
            name="filterUI"
            id="filterTable"
            onChange={(selectedOption) => {
              sortFn({ filter: selectedOption.value });
            }}
            value={optionForValue(sortConfig.filter)}
            options={timeFrameOptions}
            isSearchable={false}
          />
        </label>
      )}
    </div>
  );
};

SortUI.propTypes = {
  keys: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string, property: PropTypes.string })
  ).isRequired,
  sortFn: PropTypes.func.isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.string,
    filter: PropTypes.string,
  }),
};
SortUI.defaultProps = {
  sortConfig: {},
};
