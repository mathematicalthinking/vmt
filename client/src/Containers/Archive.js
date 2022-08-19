import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useRouteMatch } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { ArchiveLayout } from 'Layout';
import { API } from 'utils';

const SKIP_VALUE = 20;
const Archive = () => {
  const history = useHistory(); // potentially only need history pathname
  const match = useRouteMatch(); // and not url from match
  const { resource } = useParams();

  const [searchText, setSearchText] = useState('');
  const [dateRangePreset, setDateRangePreset] = useState('oneDay');
  const [customFromDate, setCustomFromDate] = useState(null);
  const [customToDate, setCustomToDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleResources, setVisibleResources] = useState([]);
  const [moreAvailable, setMoreAvailable] = useState(true);
  const [skip, setSkip] = useState(0);
  const [selected, setSelected] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  useEffect(() => {
    debounceFetchData();
    return () => {
      debounceFetchData.cancel();
      debouncedSetCriteria.cancel();
    };
  }, []);

  useEffect(() => {
    debounceFetchData();
  }, [searchText, resource, customToDate, customFromDate]);

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
      from: searchParams.get('from') || 'oneDay',
      to: searchParams.get('to'),
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
      const roomType = filter.split('-')[1];
      if (resource === 'courses') filters.roomType = null;
      else filters.roomType = roomType;
    }

    // handle from & to filters
    if (filter.indexOf('moreThan-') !== -1) {
      const unit = filter.split('-')[1];
      filters.since = unit;
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
    API.searchPaginated(resource, updatedFilters.search, skip, {
      privacySetting: 'all',
    }).then((res) => {
      const isMoreAvailable = res.data.results.length >= SKIP_VALUE;
      setLoading(false);
      setMoreAvailable(isMoreAvailable);
      setVisibleResources((prevState) =>
        concat
          ? [...prevState.visibleResources].concat(res.data.results)
          : res.data.results
      );
    });

    // this API search uses date filters, but is quite specific to
    // the Dashboard since/to date structure
    // API.getRecentActivity(
    //   resource,
    //   updatedFilters.search,
    //   skip,
    //   updatedFilters
    // ).then((res) => {
    //   const [items, totalCounts] = res.data.results;

    //   const isMoreAvailable = items.length >= SKIP_VALUE;
    //   setVisibleResources((prevState) =>
    //     concat ? [...prevState.visibleResources].concat(items) : items
    //   );
    //   setMoreAvailable(isMoreAvailable);

    //   // this.setState((prevState) => ({
    //   //   visibleResources: concat
    //   //     ? [...prevState.visibleResources].concat(items)
    //   //     : items,
    //   //   moreAvailable,
    //   //   totalCounts,
    //   // }));
    // });
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
    setLoading(true);
    setVisibleResources([]);
    setSearchText('');
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
    const checked = event.target.checked;
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

  let linkPath;
  let linkSuffix;
  // @ TODO conditional logic for displaying room in dahsboard if it belongs to the user
  if (match.params.resource === 'courses') {
    linkPath = '/myVMT/courses/';
    linkSuffix = '/rooms';
  } else if (match.params.resource === 'rooms') {
    linkPath = '/myVMT/rooms/';
    linkSuffix = '/details';
  } else {
    linkPath = '/myVMT/activities/';
    linkSuffix = '/assign';
  }

  return (
    <ArchiveLayout
      visibleResources={visibleResources}
      resource={match.params.resource}
      linkPath={linkPath}
      searchValue={searchText}
      linkSuffix={linkSuffix}
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
      handleSelectAll={handleSelectAll}
      selectAllChecked={selectAllChecked}
      selectedIds={selected}
      onSelect={handleSelectOne}
    />
  );
};

export default Archive;
