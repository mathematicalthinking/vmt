import React, { Fragment, useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { useSortableData, timeFrames } from 'utils';
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
    filter: { timeframe: timeFrames.LASTWEEK, key: 'updatedAt' },
  };
  const [fList, setFacilitatorList] = useState([]);
  const [pList, setParticipantList] = useState([]);
  const previousSearch = useRef({
    criteria: '',
    facilitatorFilter: initialConfig.filter,
    participantFilter: initialConfig.filter,
  });

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
    if (criteria !== '' && previousSearch.current.criteria === '') {
      previousSearch.current = {
        criteria,
        facilitatorFilter: facilitatorSortConfig.filter,
        participantFilter: participantSortConfig.filter,
      };
      facilitatorRequestSort({
        filter: { timeframe: timeFrames.ALL, key: 'updatedAt' },
      });
      participantRequestSort({
        filter: { timeframe: timeFrames.ALL, key: 'updatedAt' },
      });
    } else if (criteria === '' && previousSearch.current.criteria !== '') {
      facilitatorRequestSort({
        filter: previousSearch.current.facilitatorFilter,
      });
      participantRequestSort({
        filter: previousSearch.current.participantFilter,
      });
      previousSearch.current.criteria = '';
    }

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
    // check for duplicates
    const obj =
      resources &&
      resources.reduce((acc, curr) => {
        return { ...acc, [curr._id]: curr };
      }, {});
    if (obj) {
      Object.values(obj).forEach((userResource) => {
        if (userResource) {
          if (
            userResource.myRole === 'facilitator' ||
            resource === 'activities'
          ) {
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
  } else if (resource === 'activities') {
    linkSuffix = '/assign';
  } else {
    linkSuffix = '/details';
  }
  let displayResource = resource[0].toUpperCase() + resource.slice(1);
  if (displayResource === 'Activities') displayResource = 'Templates';
  if (parentResource === 'courses') {
    linkPath = `/myVMT/${parentResource}/${parentResourceId}/${resource}/`;
    linkSuffix = resource === 'activities' ? '/assign' : '/details';
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
            {fList.length >= 1 && setResourceState && (
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
            {pList.length >= 1 && setResourceState && (
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
          {fList.length > 0 ? (
            <h2 className={classes.ResourceHeader}>My {displayResource}</h2>
          ) : (
            <h2 className={classes.ResourceHeader}>
              {displayResource} I&#39;m a member of
            </h2>
          )}
          {(fList.length >= 1 || pList.length >= 1) && setResourceState && (
            <SortUI
              keys={keys}
              sortFn={
                fList.length > 0
                  ? facilitatorRequestSort
                  : participantRequestSort
              }
              sortConfig={
                fList.length > 0
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
    { label: 'All', value: timeFrames.ALL },
    { label: 'Last Day', value: timeFrames.LASTDAY },
    { label: 'Last Week', value: timeFrames.LASTWEEK },
    { label: 'Last Two Weeks', value: timeFrames.LAST2WEEKS },
    { label: 'Last Month', value: timeFrames.LASTMONTH },
    { label: 'Last Year', value: timeFrames.LASTYEAR },
    { label: 'More than a Day', value: timeFrames.AFTERDAY },
    { label: 'More than a Week', value: timeFrames.AFTERWEEK },
    { label: 'More than Two Weeks', value: timeFrames.AFTER2WEEKS },
    { label: 'More than a Month', value: timeFrames.AFTERMONTH },
    { label: 'More than a Year', value: timeFrames.AFTERYEAR },
  ];

  const optionForValue = (value) => {
    return timeFrameOptions.find((opt) => opt.value === value);
  };

  const keyName = (defaultName) => {
    const matchingKey = keys.find((key) => key.property === sortConfig.key);
    return matchingKey ? matchingKey.name : defaultName;
  };

  const labelSuffix = Math.ceil(Math.random() * 1000);

  return (
    <div className={classes.SortUIContainer}>
      <div className={classes.SortSelection}>
        <label htmlFor={`sortUI-${labelSuffix}`} className={classes.Label}>
          Sort by:
          <Select
            className={classes.Select}
            inputId={`sortUI-${labelSuffix}`}
            placeholder="Select..."
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
          />{' '}
        </label>
        <span
          style={{ padding: '0 5px' }}
          onClick={() => sortFn({ key: sortConfig.key })}
          onKeyDown={() => sortFn({ key: sortConfig.key })}
          role="button"
          tabIndex={-1}
        >
          {sortConfig.direction === 'descending' ? downArrow : upArrow}{' '}
        </span>
      </div>
      <div className={classes.FilterSelection}>
        <label htmlFor={`filterUI-${labelSuffix}`} className={classes.Label}>
          Updated:
          <Select
            placeholder="Timeframe"
            className={classes.Select}
            inputId={`filterUI-${labelSuffix}`}
            onChange={(selectedOption) => {
              sortFn({
                filter: {
                  ...sortConfig.filter,
                  timeframe: selectedOption.value,
                },
              });
            }}
            value={optionForValue(sortConfig.filter.timeframe)}
            options={timeFrameOptions}
            isSearchable={false}
          />{' '}
        </label>
      </div>
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
    filter: PropTypes.shape({
      key: PropTypes.string,
      timeframe: PropTypes.string,
    }),
  }),
};
SortUI.defaultProps = {
  sortConfig: {},
};
