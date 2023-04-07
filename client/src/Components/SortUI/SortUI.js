import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { timeFrames } from 'utils';
import { Search } from 'Components';
import classes from './resourceList.css';

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

  const previousSearch = useRef({
    criteria: sortConfig.criteria || '',
    filter: {
      ...sortConfig.filter,
      filterFcn:
        sortConfig.criteria && sortConfig.criteria !== ''
          ? (item) =>
              item.name &&
              item.name
                .toLowerCase()
                .indexOf(sortConfig.criteria.toLowerCase()) > -1
          : null,
    },
  });

  useEffect(() => {
    if (
      previousSearch.current.criteria &&
      previousSearch.current.criteria !== ''
    ) {
      previousSearch.current.filter.filterFcn = (item) =>
        item.name &&
        item.name
          .toLowerCase()
          .indexOf(previousSearch.current.criteria.toLowerCase()) > -1;
    } else {
      previousSearch.current.filter.filterFcn = null;
    }
  }, [previousSearch.current.criteria]);

  const optionForValue = (value) => {
    return timeFrameOptions.find((opt) => opt.value === value);
  };

  const keyName = (defaultName) => {
    const matchingKey = keys.find((key) => key.property === sortConfig.key);
    return matchingKey ? matchingKey.name : defaultName;
  };

  const labelSuffix = Math.ceil(Math.random() * 1000);

  const search = (criteria) => {
    if (criteria !== '' && previousSearch.current.criteria === '') {
      previousSearch.current = {
        criteria,
        filter: sortConfig.filter,
      };
      sortFn({
        criteria,
        filter: {
          ...sortConfig.filter,
          timeframe: timeFrames.ALL,
          filterFcn: (item) =>
            item.name &&
            item.name.toLowerCase().indexOf(criteria.toLowerCase()) > -1,
        },
      });
    } else if (criteria !== '' && previousSearch.current.criteria !== '') {
      sortFn({
        criteria,
        filter: {
          ...sortConfig.filter,
          filterFcn: (item) =>
            item.name &&
            item.name.toLowerCase().indexOf(criteria.toLowerCase()) > -1,
        },
      });
    } else if (criteria === '' && previousSearch.current.criteria !== '') {
      sortFn({
        criteria,
        filter: { ...previousSearch.current.filter, filterFcn: null },
      });
      previousSearch.current.criteria = '';
    }
  };

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
        <label
          htmlFor={`filterUI-${labelSuffix}`}
          className={classes.Label}
          data-testid={`filterUI-${labelSuffix}`}
        >
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
      <div className={classes.Search}>
        <Search
          isControlled
          value={sortConfig.criteria || ''}
          _search={search}
          data-testid="search"
        />
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
    criteria: PropTypes.string,
    key: PropTypes.string,
    direction: PropTypes.string,
    filter: PropTypes.shape({
      key: PropTypes.string,
      timeframe: PropTypes.string,
      filterFcn: PropTypes.func,
    }),
  }),
};
SortUI.defaultProps = {
  sortConfig: {},
};

export default SortUI;
