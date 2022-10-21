import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch, useStore } from 'react-redux';
import debounce from 'lodash/debounce';
import { ArchiveLayout } from 'Layout';
import { API } from 'utils';
import { Button, BigModal, Modal, ToolTip } from 'Components';
import { RoomPreview } from 'Containers';
import { restoreArchivedRoom } from 'store/actions';
import { STATUS } from 'constants.js';
import classes from './Archive.css';

const SKIP_VALUE = 20;

const Archive = () => {
  const history = useHistory(); // potentially only need history pathname
  const dispatch = useDispatch();
  const match = useRouteMatch(); // and not url from match
  const { resource } = useParams();
  const { archive } = useStore().getState().user;

  const [searchText, setSearchText] = useState('');
  const [dateRangePreset, setDateRangePreset] = useState('all');
  const [radioToDate, setRadioToDate] = useState(null);
  const [customFromDate, setCustomFromDate] = useState(null);
  const [customToDate, setCustomToDate] = useState(null);
  const [roomType, setRoomType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [visibleResources, setVisibleResources] = useState([]);
  const [moreAvailable, setMoreAvailable] = useState(true);
  const [skip, setSkip] = useState(0);
  const [selected, setSelected] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [showRoomPreview, setShowRoomPreview] = useState(false);
  const [roomPreviewComponent, setRoomPreviewComponent] = useState(null);
  const [showRestoreComponent, setShowRestoreComponent] = useState(false);
  const [restoreComponent, setRestoreComponent] = useState(null);

  useEffect(() => {
    debounceFetchData();
    return () => {
      debounceFetchData.cancel();
      debouncedSetCriteria.cancel();
    };
  }, []);

  useEffect(() => {
    debounceFetchData();
  }, [
    searchText,
    resource,
    radioToDate,
    customToDate,
    customFromDate,
    roomType,
  ]);

  const debounceFetchData = debounce(() => fetchData(), 1000);

  const debouncedSetCriteria = debounce((criteria) => {
    const filters = getQueryParams();
    filters.search = criteria;
    setQueryParams(filters);
  }, 700);

  const setSearchCriteria = (text) => {
    setSearchText(text);
    debouncedSetCriteria(text);
  };

  const getQueryParams = () => {
    const searchParams = new URLSearchParams(history.location.search);
    const filters = {
      roomType: searchParams.get('roomType'),
      search: searchParams.get('search'),
      from: searchParams.get('from') || 0,
      to: searchParams.get('to') || Date.now(),
    };
    return filters;
  };

  const setQueryParams = (filters) => {
    const { roomType, search, from, to } = filters;
    history.push({
      pathname: match.url,
      search: `&roomType=${roomType || 'all'}&from=${from ||
        'oneDay'}&to=${to || ''}&search=${search || ''}`,
    });
  };

  const toggleFilter = (filter) => {
    const filters = getQueryParams();

    // handle roomType filter
    if (filter.indexOf('room-') !== -1) {
      const roomTypeInput = filter.split('-')[1];
      if (resource === 'courses') filters.roomType = null;
      else filters.roomType = roomTypeInput;
      setRoomType(roomTypeInput);
    }

    // handle from & to filters
    if (filter.indexOf('moreThan-') !== -1) {
      const unit = filter.split('-')[1];
      const calculateTo = {
        all: 0,
        afterDay: 24 * 60 * 60 * 1000,
        afterWeek: 7 * 24 * 60 * 60 * 1000,
        after2Weeks: 2 * 7 * 24 * 60 * 60 * 1000,
        afterMonth: 30 * 24 * 60 * 60 * 1000,
        afterYear: 356 * 24 * 60 * 60 * 1000,
      };
      filters.from = new Date('01 Jan 2018').getTime();
      filters.to = new Date().getTime() - calculateTo[unit];
      setRadioToDate(filters.to);
      setDateRangePreset(unit);
    }

    // handle custom date filter
    if (filter === 'custom') {
      const customFrom = new Date();
      const customTo = new Date();
      filters.from = customFrom.getTime();
      filters.to = customTo.getTime();
      setDateRangePreset('custom');
      setCustomToDate(customTo);
      setCustomFromDate(customFrom);
    }

    setQueryParams(filters);
  };

  const fetchData = (concat = false) => {
    setLoading(true);
    const filters = getQueryParams();
    // if filter = all we're not actually filtering...we want all
    const updatedFilters = { ...filters };

    if (updatedFilters.roomType === 'all') {
      delete updatedFilters.roomType;
    }

    if (archive && archive[resource] && archive[resource].length > 0) {
      API.searchPaginatedArchive(resource, updatedFilters.search, skip, {
        ids: archive[resource],
        ...updatedFilters,
        // roomType: updatedFilters.roomType,
      })
        .then((res) => {
          const isMoreAvailable = res.data.results.length >= SKIP_VALUE;
          setLoading(false);
          setMoreAvailable(isMoreAvailable);
          setVisibleResources((prevState) =>
            concat
              ? [...prevState.visibleResources].concat(res.data.results)
              : res.data.results
          );
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
          // eslint-disable-next-line no-alert
          window.alert(
            'Error loading the results. Please refresh the page and try again.'
          );
        });
    } else {
      setLoading(false);
      setMoreAvailable(false);
    }
  };

  const setSkipState = () => {
    setSkip(
      (prevState) => ({
        skip: prevState.skip + SKIP_VALUE,
      }),
      () => {
        fetchData(true);
      }
    );
  };

  const clearSearch = () => {
    setSearchText('');
    setLoading(true);
    setVisibleResources([]);
  };

  const setFromDate = (date) => {
    let filters = getQueryParams();
    const ms = date.getTime();
    filters = { ...filters, since: ms };
    setCustomFromDate(date);
    setQueryParams(filters);
  };

  const setToDate = (date) => {
    let filters = getQueryParams();
    const ms = date.getTime();
    filters = { ...filters, to: ms };
    setCustomToDate(date);
    setQueryParams(filters);
  };

  const handleSelectAll = (event) => {
    const { checked } = event.target;
    if (!checked) {
      setSelectAllChecked(false);
      setSelected([]);
    } else {
      const ids = visibleResources.map((res) => res._id);
      setSelectAllChecked(true);
      setSelected(ids);
    }
  };

  const handleSelectOne = (event, id) => {
    const { checked } = event.target;
    if (checked) {
      setSelected((prevState) => [...prevState, id]);
      if (selected.length + 1 === visibleResources.length) {
        setSelectAllChecked(true);
      } else setSelectAllChecked(false);
    } else {
      setSelected((prevState) => [...prevState.filter((el) => id !== el)]);
      setSelectAllChecked(false);
    }
  };

  const getResourceNames = (ids) => {
    return visibleResources
      .filter((resource) => ids.includes(resource._id))
      .map((res) => res.name);
  };

  const restoreButton = {
    title: 'Unarchive',
    onClick: (e, id) => {
      e.preventDefault();
      setShowRestoreComponent(true);
      handleRestore(id);
    },
    icon: (
      <ToolTip text="Unarchive" delay={600}>
        <span className={`material-symbols-outlined ${classes.CustomIcon}`}>
          output
        </span>
      </ToolTip>
    ),
  };

  const handleRestore = (id) => {
    let showModal = true;
    let resourceNames;
    let singleResource = true;
    if (Array.isArray(id)) {
      singleResource = false;
      resourceNames = getResourceNames(id).join(', ');
    } else
      resourceNames = visibleResources.filter((el) => el._id === id)[0].name;

    const dispatchRestore = () => {
      if (singleResource) {
        dispatch(restoreArchivedRoom(id, { status: STATUS.DEFAULT }));
      } else
        id.forEach((resId) =>
          dispatch(restoreArchivedRoom(resId, { status: STATUS.DEFAULT }))
        );
      // re-fetch to clear restored rooms from the page
      // and to get an accurate search
      debounceFetchData();
    };

    setRestoreComponent(
      <Modal
        // show={showRestoreComponent} // doesn't work
        show={showModal}
        closeModal={() => {
          // showRestoreComponent = false;
          showModal = false;
          setShowRestoreComponent(false);
        }}
      >
        <span>
          Are you sure you want to restore{' '}
          <span style={{ fontWeight: 'bolder' }}>{resourceNames}</span>
        </span>
        <div className={''}>
          <Button
            data-testid="restore-resource"
            click={() => {
              dispatchRestore();
              showModal = false;
              setShowRestoreComponent(false);
            }}
            m={5}
          >
            Yes
          </Button>
          <Button
            data-testid="cancel-manage-user"
            click={() => {
              showModal = false;
              setShowRestoreComponent(false);
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
    restoreButton,
  ];

  const selectActions = [restoreButton];

  // selected = selectedIds do i still need that as;ldkjasdl;fjkasdflkjasdfl;kasdf
  return (
    <ArchiveLayout
      visibleResources={visibleResources}
      resource={match.params.resource}
      searchValue={searchText}
      setSkip={setSkipState}
      setCriteria={setSearchCriteria}
      moreAvailable={moreAvailable}
      filters={getQueryParams()}
      toggleFilter={toggleFilter}
      loading={loading}
      onTabChange={clearSearch}
      dateRangePreset={dateRangePreset}
      customFromDate={customFromDate}
      customToDate={customToDate}
      setToDate={setToDate}
      setFromDate={setFromDate}
      icons={customIcons}
      showRoomPreview={showRoomPreview}
      roomPreviewComponent={roomPreviewComponent}
      showRestoreComponent={showRestoreComponent}
      restoreComponent={restoreComponent}
      selectActions={selectActions}
    />
  );
};

export default Archive;
