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
}) => {
  const [fList, setFacilitatorList] = useState([]);
  const [pList, setParticipantList] = useState([]);

  // componentDidMount
  useEffect(() => {
    const { facilitatorList, participantList } = sortUserResources(
      userResources
    );
    setFacilitatorList(facilitatorList);
    setParticipantList(participantList);
  }, []);

  // componentDidUpdate
  useEffect(() => {
    const { facilitatorList, participantList } = sortUserResources(
      userResources
    );
    setFacilitatorList(facilitatorList);
    setParticipantList(participantList);
  }, [userResources]);

  // TODO FIX `search` &  `sortUserResources`
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

  // copied from render before return
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

  // Use useSortableData hook to enable user-controlled sorts
  const initialConfig = { key: 'updatedAt', direction: 'descending' };
  const {
    items: facilitatorItems,
    requestSort: facilitatorRequestSort,
  } = useSortableData(fList, initialConfig);
  const {
    items: participantItems,
    requestSort: participantRequestSort,
  } = useSortableData(pList, initialConfig);
  const keys = [
    { property: 'updatedAt', name: 'Last Updated' },
    { property: 'name', name: 'Name' },
    { property: 'createdAt', name: 'Created Date' },
    { property: 'dueDate', name: 'Due Date' },
  ];

  return (
    <div>
      {/* @TODO don't show create optinos for participants */}
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
            {facilitatorItems.length > 1 && (
              <SortUI keys={keys} sortFn={facilitatorRequestSort} />
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
            {participantItems.length > 1 && (
              <SortUI keys={keys} sortFn={participantRequestSort} />
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
          {(facilitatorItems.length > 1 || participantItems.length > 1) && (
            <SortUI
              keys={keys}
              sortFn={
                fList.length > 0 || displayResource !== 'Templates'
                  ? facilitatorRequestSort
                  : participantRequestSort
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
  user: PropTypes.shape({}).isRequired,
  userResources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

ResourceList.defaultProps = {
  parentResource: null,
  parentResourceId: null,
};

export default ResourceList;

/**
 * Component to Set and Show the Sort Arrow (ascending = '↑', descending = '↓')
 */

const SortUI = ({ keys, sortFn }) => {
  // const upArrow = <i className="fas fa-solid fa-sort-up" />
  // const downArrow = <i className="fas fa-solid fa-sort-down" />
  const upArrow = <i className="fas fa-solid fa-arrow-up" />;
  const downArrow = <i className="fas fa-solid fa-arrow-down" />;
  const [arrow, setArrow] = useState(downArrow);
  const [sortKey, setSortKey] = useState();
  const [sortDirection, setSortDirection] = useState('down');

  const handleArrowClick = () => {
    setSortDirection((prevDir) => (prevDir === 'up' ? 'down' : 'up'));
    setArrow(sortDirection === 'up' ? downArrow : upArrow);
    if (sortKey) sortFn(sortKey);
  };

  useEffect(() => {
    sortFn(keys[0].property);
    setSortKey(keys[0].property);
  }, []);

  return (
    <div>
      <label htmlFor="sortTable" className={classes.Label}>
        Sort By:
        <Select
          placeholder="Select..."
          className={classes.Select}
          name="sortUI"
          id="sortTable"
          onChange={(selectedOption) => {
            sortFn(selectedOption.value);
            setSortKey(selectedOption.value);
            setArrow(downArrow);
            setSortDirection('down');
          }}
          defaultValue={{ label: keys[0].name, value: keys[0].property }}
          options={keys.map((key) => ({
            value: key.property,
            label: key.name,
          }))}
        />
        <span onClick={handleArrowClick}>{arrow}</span>
      </label>
    </div>
  );
};

SortUI.propTypes = {
  keys: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  sortFn: PropTypes.func.isRequired,
};
