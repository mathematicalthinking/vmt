import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import { ArchiveLayout } from 'Layout';
import { API, useAppModal, GOOGLE_ICONS, getGoogleIcons } from 'utils';
import { Button, ToolTip } from 'Components';
import { RoomPreview } from 'Containers';
import { restoreArchivedRoom } from 'store/actions';
import classes from './Archive.css';

const SKIP_VALUE = 20;

const Archive = () => {
  const history = useHistory(); // potentially only need history pathname
  const dispatch = useDispatch();
  const match = useRouteMatch(); // and not url from match
  const { resource } = useParams();
  const archive = useSelector((state) => state.user && state.user.archive);

  const [searchText, setSearchText] = useState('');
  const [dateRangePreset, setDateRangePreset] = useState('all');
  const [radioToDate, setRadioToDate] = useState(null);
  const [customFromDate, setCustomFromDate] = useState(null);
  const [customToDate, setCustomToDate] = useState(null);
  const [roomType, setRoomType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [visibleResources, setVisibleResources] = useState([]);
  const [moreAvailable, setMoreAvailable] = useState(true);
  const skip = useRef(0);
  const { show: showWarning, showBig, hide: hideWarning } = useAppModal();

  useEffect(() => {
    debounceFetchData();
    return () => {
      debounceFetchData.cancel();
      debouncedSetCriteria.cancel();
    };
  }, []);

  useEffect(() => {
    skip.current = 0;
    debounceFetchData();
  }, [
    searchText,
    resource,
    radioToDate,
    customToDate,
    customFromDate,
    roomType,
  ]);

  const debounceFetchData = debounce(
    (concat = false, callback = null) => fetchData(concat, callback),
    1000
  );

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
    const { roomType: newRoomType, search, from, to } = filters;
    skip.current = 0;
    history.push({
      pathname: match.url,
      search: `&roomType=${newRoomType || 'all'}&from=${from ||
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
      filters.from = 0;
      filters.to = Date.now() - calculateTo[unit];
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

  const fetchData = (concat = false, callback = null) => {
    setLoading(true);
    const filters = getQueryParams();
    const updatedFilters = { ...filters };

    if (updatedFilters.roomType === 'all') {
      delete updatedFilters.roomType;
    }

    if (archive && archive[resource] && archive[resource].length > 0) {
      API.searchPaginatedArchive(
        resource,
        updatedFilters.search,
        skip.current,
        {
          ...updatedFilters,
        }
      )
        .then((res) => {
          const isMoreAvailable = res.data.results.length >= SKIP_VALUE;
          setLoading(false);
          setMoreAvailable(isMoreAvailable);
          setVisibleResources((prevState) =>
            concat ? [...prevState].concat(res.data.results) : res.data.results
          );
          if (callback) callback();
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

  const handleLoadMore = (callback) => {
    skip.current += SKIP_VALUE;
    if (skip.current > 0) fetchData(true, callback);
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

  const getResourceNames = (ids) => {
    return visibleResources
      .filter((res) => ids.includes(res._id))
      .map((res) => res.name);
  };

  const restoreButton = {
    title: 'Unarchive',
    onClick: (e, id) => {
      if (!id.length) return;
      e.preventDefault();
      handleRestore(id);
    },
    generateIcon: (selectedIds) => {
      const enableUnarchiveButton = selectedIds.length > 0;
      const fontWeight = enableUnarchiveButton ? 'normal' : '200';
      const cursor = enableUnarchiveButton ? 'pointer' : 'default';
      const style = { fontWeight, cursor };

      return (
        <ToolTip text="Unarchive" delay={600}>
          {getGoogleIcons(GOOGLE_ICONS.UNARCHIVE, [classes.CustomIcon], style)}
        </ToolTip>
      );
    },
  };

  const handleRestore = (id) => {
    let resourceNames;
    let msg = 'Are you sure you want to restore ';
    let singleResource = true;
    if (Array.isArray(id)) {
      singleResource = false;
      if (id.length <= 5) {
        resourceNames = getResourceNames(id).join(', ');
      } else {
        resourceNames = `${id.length} rooms`;
        msg += ' these ';
      }
    } else
      resourceNames = visibleResources.filter((el) => el._id === id)[0].name;

    const dispatchRestore = () => {
      if (singleResource) {
        dispatch(restoreArchivedRoom(id));
      } else id.forEach((resId) => dispatch(restoreArchivedRoom(resId)));
      // re-fetch to clear restored rooms from the page
      // and to get an accurate search
      debounceFetchData();
    };

    showWarning(
      <div>
        <span>
          {msg}
          <span style={{ fontWeight: 'bolder' }}>{resourceNames}</span>?
        </span>
        <div className="">
          <Button
            data-testid="restore-resource"
            click={() => {
              dispatchRestore();
              hideWarning();
            }}
            m={5}
          >
            Yes
          </Button>
          <Button
            data-testid="cancel-manage-user"
            click={hideWarning}
            theme="Cancel"
            m={5}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const goToReplayer = (roomId) => {
    history.push(`/myVMT/workspace/${roomId}/replayer`);
  };

  const goToRoomPreview = (roomId) => {
    showBig(<RoomPreview roomId={roomId} />);
  };

  const customIcons = [
    {
      title: 'Preview',
      onClick: (e, id) => {
        e.preventDefault();
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
    restoreButton,
  ];

  const selectActions = [restoreButton];

  // selected = selectedIds do i still need that as;ldkjasdl;fjkasdflkjasdfl;kasdf
  return (
    <ArchiveLayout
      visibleResources={visibleResources}
      resource={match.params.resource}
      searchValue={searchText}
      onLoadMore={handleLoadMore}
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
      selectActions={selectActions}
      totalNumberOfArchivedRooms={
        (archive && archive.rooms && archive.rooms.length) || 0
      }
    />
  );
};

export default Archive;
