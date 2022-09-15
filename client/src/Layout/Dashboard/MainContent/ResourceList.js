import React, { Fragment, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { useSortableData } from 'utils';
import SelectableBoxList from 'Layout/SelectableBoxList/SelectableBoxList';
import { Button, Modal, BigModal, Search, ToolTip } from 'Components';
import { RoomPreview } from 'Containers';
import { updateRoom } from 'store/actions';
import { STATUS } from 'constants.js';
import BoxList from '../../BoxList/BoxList';
import NewResource from '../../../Containers/Create/NewResource/NewResource';
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
  selectableBoxList,
}) => {
  const initialConfig = {
    key: 'updatedAt',
    direction: 'descending',
    filter: 'last2Weeks',
  };

  const history = useHistory();
  const dispatch = useDispatch();
  const [fList, setFacilitatorList] = useState([]);
  const [pList, setParticipantList] = useState([]);
  const [archiveComponent, setArchiveComponent] = useState(null);
  const [showArchiveComponent, setShowArchiveComponent] = useState(false);
  const [roomPreviewComponent, setRoomPreviewComponent] = useState(null);
  const [showRoomPreview, setShowRoomPreview] = useState(false);

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

  const archiveButton = {
    title: 'Archive',
    onClick: (e, id) => {
      e.preventDefault();
      if (!id.length) return;
      setShowArchiveComponent(true);
      handleArchive(id);
    },
    icon: (
      <ToolTip text="Archive" delay={600}>
        <span
          className={`material-symbols-outlined ${classes.CustomIcon}`}
          data-testid="Archive"
          style={{ fontSize: '23px' }}
        >
          input
        </span>
      </ToolTip>
    ),
  };

  const customIcons = [
    {
      title: 'Preview',
      onClick: (e, id) => {
        e.preventDefault();
        setShowRoomPreview(true);
        goToRoomPreview(id);
      },
      // icon: <i className="fas fa-external-link-alt" />,
      icon: (
        <span className={`material-symbols-outlined ${classes.CustomIcon}`}>
          open_in_new
        </span>
      ),
    },
    {
      title: 'Replayer',
      onClick: (e, id) => {
        e.preventDefault();
        goToReplayer(id);
      },
      icon: (
        <span className={`material-symbols-outlined ${classes.CustomIcon}`}>
          replay
        </span>
      ),
    },
    {
      title: 'Archive',
      onClick: (e, id) => {
        e.preventDefault();
        setShowArchiveComponent(true);
        handleArchive(id);
      },
      icon: (
        <span className={`material-symbols-outlined ${classes.CustomIcon}`}>
          input
        </span>
      ),
    },
  ];

  // create a handle multiple fn that calls this fn
  // get rid of singleResource
  const handleArchive = (id) => {
    let showModal = true;
    let res;
    let singleResource = true;
    if (Array.isArray(id)) {
      // display each name in list
      singleResource = false;
      res = getResourceNames(id).join(', ');
    }
    // or display single name
    else
      res = facilitatorItems
        .concat(participantItems)
        .filter((el) => el._id === id)[0].name;

    const dispatchArchive = () => {
      if (singleResource) {
        const rtnObj = {
          ...userResources.find((userResource) => userResource._id === id),
          status: STATUS.ARCHIVED,
        };

        console.group();
        console.log('id', id);
        console.log('rtnObj');
        console.log(rtnObj);
        console.log(`dispatch(updateRoom(id, rtnObj))`);
        console.groupEnd();

        dispatch(updateRoom(id, rtnObj));
      } else {
        id.forEach((resId) => {
          console.log(
            '...userResources.find((userResource) => userResource._id === resId)'
          );
          console.log(
            ...userResources.find((userResource) => userResource._id === resId)
          );
          dispatch(
            updateRoom(resId, {
              ...userResources.find(
                (userResource) => userResource._id === resId
              ),
              status: STATUS.ARCHIVED,
            })
          );
        });
      }
    };

    setArchiveComponent(
      <Modal
        show={showModal}
        closeModal={() => {
          showModal = false;
          setShowArchiveComponent(false);
        }}
      >
        <span>
          Are you sure you want to archive{' '}
          <span style={{ fontWeight: 'bolder' }}>{res}</span>?
        </span>
        <div className={''}>
          <Button
            data-testid="archive-resource"
            click={() => {
              dispatchArchive();
              showModal = false;
              setShowArchiveComponent(false);
            }}
            m={5}
          >
            Yes
          </Button>
          <Button
            data-testid="cancel-manage-user"
            click={() => {
              showModal = false;
              setShowArchiveComponent(false);
            }}
            theme="Cancel"
            m={5}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    );
  };

  const goToReplayer = (roomId) => {
    history.push(`/myVMT/workspace/${roomId}/replayer`);
  };

  const goToRoomPreview = (roomId) => {
    let showM = true;
    setShowRoomPreview(true);
    setRoomPreviewComponent(
      <BigModal
        show={showM}
        closeModal={() => {
          setShowRoomPreview(false);
          showM = false;
        }}
      >
        <RoomPreview roomId={roomId} />
      </BigModal>
    );
  };

  const getResourceNames = (ids) => {
    return facilitatorItems
      .concat(participantItems)
      .filter((resource) => ids.includes(resource._id))
      .map((res) => res.name);
  };

  const selectActions = [archiveButton];

  return (
    <React.Fragment>
      {showRoomPreview && roomPreviewComponent}
      {showArchiveComponent && archiveComponent}
      <div>
        {/* @TODO don't show create options for participants */}
        <div className={classes.Controls}>
          <div className={classes.Search}>
            <Search _search={search} data-testid="search" />
          </div>
          {create}
        </div>
        {fList.length > 0 || pList.length > 0 ? (
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

              {selectableBoxList &&
              resource !== 'activities' &&
              resource !== 'courses' ? (
                <SelectableBoxList
                  list={facilitatorItems}
                  resource={resource}
                  listType="private"
                  linkPath={linkPath}
                  linkSuffix={linkSuffix}
                  notifications={notifications}
                  parentResourec={parentResource}
                  icons={customIcons}
                  selectActions={selectActions}
                />
              ) : (
                <BoxList
                  list={facilitatorItems}
                  resource={resource}
                  listType="private"
                  linkPath={linkPath}
                  linkSuffix={linkSuffix}
                  notifications={notifications}
                  parentResourec={parentResource}
                />
              )}
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
            />
          </Fragment>
        )}
      </div>
    </React.Fragment>
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
    { label: 'Last Two Weeks', value: 'last2Weeks' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Last Year', value: 'lastYear' },
    { label: 'More than a Day', value: 'afterDay' },
    { label: 'More than a Week', value: 'afterWeek' },
    { label: 'More than Two Weeks', value: 'after2Weeks' },
    { label: 'More than a Month', value: 'afterMonth' },
    { label: 'More than a Year', value: 'afterYear' },
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
        // eslint-disable-next-line jsx-a11y/label-has-associated-control
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
  selectableBoxList: PropTypes.bool,
};
SortUI.defaultProps = {
  sortConfig: {},
  selectableBoxList: false,
};
