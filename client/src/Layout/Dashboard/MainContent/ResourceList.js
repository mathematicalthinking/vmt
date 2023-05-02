import React, { Fragment, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  useSortableData,
  timeFrames,
  amIAFacilitator,
  useUIState,
  GOOGLE_ICONS,
  getGoogleIcons,
} from 'utils';
import SelectableBoxList from 'Layout/SelectableBoxList/SelectableBoxList';
import { Button, BigModal, Modal, SortUI, ToolTip } from 'Components';
import { RoomPreview } from 'Containers';
import { archiveRooms } from 'store/actions';
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
  selectableBoxList,
  context, // provides the context in which ResourceList is being used
}) => {
  const initialConfig = {
    key: 'updatedAt',
    direction: 'descending',
    filter: { timeframe: timeFrames.LASTWEEK, key: 'updatedAt' },
  };

  const history = useHistory();
  const dispatch = useDispatch();
  const [fList, setFacilitatorList] = useState([]);
  const [pList, setParticipantList] = useState([]);
  const [archiveComponent, setArchiveComponent] = useState(null);
  const [showArchiveComponent, setShowArchiveComponent] = useState(false);
  const [roomPreviewComponent, setRoomPreviewComponent] = useState(null);
  const [showRoomPreview, setShowRoomPreview] = useState(false);

  // store and restore the state of the sort/filters for when the user navigates away and back
  const [resourceState, setResourceState] = useUIState(context, {
    facilitatorConfig: initialConfig,
    participantConfig: initialConfig,
  });

  // Use useSortableData hook to enable user-controlled sorting
  const {
    items: facilitatorItems,
    resetSort: facilitatorRequestSort,
    sortConfig: facilitatorSortConfig,
  } = useSortableData(fList, resourceState.facilitatorConfig);

  const {
    items: participantItems,
    resetSort: participantRequestSort,
    sortConfig: participantSortConfig,
  } = useSortableData(pList, resourceState.participantConfig);

  const keys = [
    { property: 'updatedAt', name: 'Last Updated' },
    { property: 'name', name: 'Name' },
    { property: 'createdAt', name: 'Created Date' },
    { property: 'dueDate', name: 'Due Date' },
  ];

  // if the UI state changes, update the UIState variable
  useEffect(() => {
    setResourceState({
      facilitatorConfig: facilitatorSortConfig,
      participantConfig: participantSortConfig,
    });
  }, [facilitatorSortConfig, participantSortConfig]);

  useEffect(() => {
    const { facilitatorList, participantList } = sortUserResources(
      userResources
    );

    setFacilitatorList(facilitatorList);
    setParticipantList(participantList);

    facilitatorRequestSort(resourceState.facilitatorConfig);
    participantRequestSort(resourceState.participantConfig);
  }, [userResources]);

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
            amIAFacilitator(userResource, user._id) ||
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
  if (
    parentResource !== 'activities' &&
    context !== 'activity' &&
    user.accountType === 'facilitator'
  ) {
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
        {getGoogleIcons(
          GOOGLE_ICONS.ARCHIVE,
          [classes.CustomIcon],
          { fontSize: '23px' },
          { 'data-testid': 'Archive' }
        )}
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
        <ToolTip text="Preview" delay={600}>
          {getGoogleIcons(GOOGLE_ICONS.PREVIEW, [classes.CustomIcon])}
        </ToolTip>
      ),
    },
    {
      title: 'Replayer',
      onClick: (e, id) => {
        e.preventDefault();
        goToReplayer(id);
      },
      icon: (
        <ToolTip text="Replayer" delay={600}>
          {getGoogleIcons(GOOGLE_ICONS.REPLAYER, [classes.CustomIcon])}
        </ToolTip>
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
        <ToolTip text="Archive" delay={600}>
          {getGoogleIcons(GOOGLE_ICONS.ARCHIVE, [classes.CustomIcon])}
        </ToolTip>
      ),
    },
  ];

  const customIconsBoxList = [...customIcons].filter(
    (icon) => icon.title !== 'Archive'
  );

  // create a handle multiple fn that calls this fn
  // get rid of singleResource
  const handleArchive = (id) => {
    let showModal = true;
    let res;
    let msg = 'Are you sure you want to archive ';
    let singleResource = true;
    if (Array.isArray(id)) {
      // display each name in list
      singleResource = false;
      // only dipslay first 5 resources names, otherwise total number
      if (id.length <= 5) {
        res = getResourceNames(id).join(', ');
      } else {
        res = `${id.length} rooms`;
        msg += ' these ';
      }
    }
    // or display single name
    else
      res = facilitatorItems
        .concat(participantItems)
        .filter((el) => el._id === id)[0].name;

    const dispatchArchive = () => {
      if (singleResource) {
        dispatch(archiveRooms([id]));
      } else {
        dispatch(archiveRooms(id));
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
          {msg}
          <span style={{ fontWeight: 'bolder' }}>{res}</span>?
        </span>
        <div>
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
      .filter((res) => ids.includes(res._id))
      .map((res) => res.name);
  };

  const SelectableBoxListCustomStyles = {
    container: {},
    header: {
      maxWidth: '575px',
      height: '35px',
    },
    checkbox: {
      padding: '10px',
      marginRight: '2rem',
      background: 'rgb(239, 243, 246)',
      border: '1px solid #ddd',
      fontWeight: '600',
      fontSize: '1.1em',
      borderRadius: '3px',
    },
    selectactions: {
      background: 'rgb(239, 243, 246)',
      border: '1px solid #ddd',
      width: '4rem',
      display: 'flex',
      justifyContent: 'space-around',
    },
    contentbox: {},
  };

  const selectActions = [archiveButton];

  return (
    <React.Fragment>
      {showRoomPreview && roomPreviewComponent}
      {showArchiveComponent && archiveComponent}
      <div>
        {/* @TODO don't show create options for participants */}
        <div className={classes.Controls}>{create}</div>
        {fList.length > 0 || pList.length > 0 ? (
          <div className={classes.Row}>
            {fList.length > 0 ? (
              <div className={classes.Col}>
                <h2 className={classes.ResourceHeader}>
                  {displayResource} I Manage: {fList.length}
                </h2>
                {fList.length >= 1 && setResourceState && (
                  <SortUI
                    keys={keys}
                    sortFn={facilitatorRequestSort}
                    sortConfig={facilitatorSortConfig}
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
                    customStyle={SelectableBoxListCustomStyles}
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
            ) : null}
            {pList.length > 0 ? (
              <div className={classes.Col}>
                <h2 className={classes.ResourceHeader}>
                  {displayResource} I&#39;m a member of: {pList.length}
                </h2>
                {pList.length >= 1 && setResourceState && (
                  <SortUI
                    keys={keys}
                    sortFn={participantRequestSort}
                    sortConfig={participantSortConfig}
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
                  icons={customIconsBoxList}
                  // draggable
                />
              </div>
            ) : null}
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
                    ? facilitatorSortConfig
                    : participantSortConfig
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
  user: PropTypes.shape({
    accountType: PropTypes.string,
    _id: PropTypes.string,
  }).isRequired,
  userResources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  selectableBoxList: PropTypes.bool,
  context: PropTypes.string,
};

ResourceList.defaultProps = {
  parentResource: null,
  parentResourceId: null,
  selectableBoxList: false,
  context: null,
};

export default ResourceList;
