import React from 'react';

const timeFrameFcns = {
  all: () => true,
  lastDay: (diff) => diff <= 24 * 60 * 60 * 1000,
  lastWeek: (diff) => diff <= 7 * 24 * 60 * 60 * 1000,
  last2Weeks: (diff) => diff <= 2 * 7 * 24 * 60 * 60 * 1000,
  lastMonth: (diff) => diff <= 30 * 24 * 60 * 60 * 1000,
  lastYear: (diff) => diff <= 356 * 24 * 60 * 60 * 1000,
  afterDay: (diff) => diff > 24 * 60 * 60 * 1000,
  afterWeek: (diff) => diff > 7 * 24 * 60 * 60 * 1000,
  after2Weeks: (diff) => diff > 2 * 7 * 24 * 60 * 60 * 1000,
  afterMonth: (diff) => diff > 30 * 24 * 60 * 60 * 1000,
  afterYear: (diff) => diff > 356 * 24 * 60 * 60 * 1000,
};

export const timeFrames = {
  ALL: 'all',
  LASTDAY: 'lastDay',
  LASTWEEK: 'lastWeek',
  LAST2WEEKS: 'last2Weeks',
  LASTMONTH: 'lastMonth',
  LASTYEAR: 'lastYear',
  AFTERDAY: 'afterDay',
  AFTERWEEK: 'afterWeek',
  AFTER2WEEKS: 'after2Weeks',
  AFTERMONTH: 'afterMonth',
  AFTERYEAR: 'afterYear',
};

/**
 * Custom hook for sorting and filtering table data.  Note that filter must be one of all, lastDay, lastWeek, last2Weeks, lastMonth, or lastYear. Adapted from https://www.smashingmagazine.com/2020/03/sortable-tables-react/.
 * @param {array} items - The data array. Each element represents a row as an object, with the properties (keys) representing the table columns
 * @param {object} [config = null] - Optional specification of an initial sorting of the form { key, direction, filter }
 * @returns {array} items - The data sorted by the requested column (key), in the requested direction, filtered by the requested filter.
 * @returns {object} sortConfig - The current sorting: { key, direction, filter }. Note that filter must be one of all, lastDay, lastWeek, last2Weeks, lastMonth, or lastYear.
 * @returns {function} requestSort - Takes a key and sorts the items accordingly. If not direction is supplied, the current direction is reversed.
 * @returns {function} resetSort - Takes a sortConfig object. That object is merged with the current sortConfig then the items are sorted and filtered appropriately.
 */

export const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = React.useState(config);

  const withinTimeframe = (item) => {
    if (
      !sortConfig ||
      !item[sortConfig.key] ||
      !sortConfig.filter ||
      !sortConfig.filter.timeframe ||
      !sortConfig.filter.key ||
      !timeFrameFcns[sortConfig.filter.timeframe]
    )
      return true;
    const now = new Date();
    const then = new Date(item[sortConfig.filter.key]);
    return then.toString() !== 'Invalid Date'
      ? timeFrameFcns[sortConfig.filter.timeframe](Math.abs(then - now))
      : true;
  };

  const matchesCustomFilter = (item) => {
    if (
      !sortConfig ||
      !sortConfig.filter ||
      (!sortConfig.filter.filterFcn &&
        typeof sortConfig.filter.filterFcn !== 'function')
    )
      return true;
    return sortConfig.filter.filterFcn(item);
  };

  const sortedItems = React.useMemo(() => {
    // eslint-disable-next-line prefer-const
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const first =
          typeof a[sortConfig.key] === 'string'
            ? a[sortConfig.key].toLowerCase()
            : a[sortConfig.key];

        const second =
          typeof b[sortConfig.key] === 'string'
            ? b[sortConfig.key].toLowerCase()
            : b[sortConfig.key];

        if (first < second) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (first > second) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(
      (item) => withinTimeframe(item) && matchesCustomFilter(item)
    );
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ ...sortConfig, key, direction });
  };

  const resetSort = ({ key, direction, filter, ...others }) => {
    if (key && !direction && !filter) requestSort(key);
    else if (sortConfig)
      setSortConfig({
        key: key || sortConfig.key,
        direction: direction || sortConfig.direction,
        filter: filter || sortConfig.filter,
        ...others,
      });
    else setSortConfig({ key, direction, filter, ...others });
  };

  return { items: sortedItems, requestSort, sortConfig, resetSort };
};
