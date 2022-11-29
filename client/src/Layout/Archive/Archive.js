import React, { Fragment } from 'react';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';
import { SelectableBoxList } from 'Layout';
import { Search, CustomLink, Button, RadioBtn, InfoBox } from 'Components';
import classes from './archive.css';

const Archive = (props) => {
  const {
    visibleResources,
    resource,
    searchValue,
    onLoadMore,
    setCriteria,
    moreAvailable,
    filters,
    toggleFilter,
    loading,
    onTabChange,
    dateRangePreset,
    customFromDate,
    customToDate,
    setToDate,
    setFromDate,
    icons,
    selectActions,
    actionComponent,
  } = props;

  return (
    <React.Fragment>
      {actionComponent}

      <div className={classes.Container}>
        <div className={classes.Header}>
          <h3 className={classes.Title}>
            {/* Search for your archived Rooms and Courses */}
            Search for your archived Rooms
          </h3>
          <div className={classes.ResourceOpts} data-testid="resource-tabs">
            {/* <div
              onClick={onTabChange}
              onKeyDown={onTabChange}
              tabIndex={-1}
              role="button"
            >
              <CustomLink to="/archive/rooms?&roomType=all">Rooms</CustomLink>
            </div> */}
            {/* <div
              onClick={onTabChange}
              onKeyDown={onTabChange}
              tabIndex={-1}
              role="button"
            >
              <CustomLink to="/archive/courses?">Courses</CustomLink>
            </div> */}
          </div>
          <div className={classes.Search}>
            <Search
              isControlled
              value={searchValue}
              _search={(value) => setCriteria(value)}
              placeholder="Search by name, description, or facilitators..."
              data-testid="archive-search"
            />
          </div>
          <div className={classes.Filters}>
            {/* <i className={['fas fa-sliders-h', classes.FilterIcon].join(' ')} /> */}
            {resource !== 'courses' ? (
              <InfoBox title="Room Type" icon={<i className="fas fa-filter" />}>
                <div className={classes.FilterOpts}>
                  <RadioBtn
                    data-testid="all-roomType-filter"
                    check={() => toggleFilter('room-all')}
                    checked={filters.roomType === 'all'}
                    name="All-roomType"
                  >
                    All
                  </RadioBtn>
                  <RadioBtn
                    data-testid="desmos-activity-filter"
                    check={() => toggleFilter('room-desmosActivity')}
                    checked={filters.roomType === 'desmosActivity'}
                    name="DesmosActivity"
                  >
                    Desmos Activity
                  </RadioBtn>
                  <RadioBtn
                    data-testid="geogebra-filter"
                    check={() => toggleFilter('room-geogebra')}
                    checked={filters.roomType === 'geogebra'}
                    name="GeoGebra"
                  >
                    GeoGebra
                  </RadioBtn>
                  <RadioBtn
                    data-testid="desmos-filter"
                    check={() => toggleFilter('room-desmos')}
                    checked={filters.roomType === 'desmos'}
                    name="Desmos"
                  >
                    Desmos
                  </RadioBtn>
                  {window.env.REACT_APP_PYRET_MODE &&
                    window.env.REACT_APP_PYRET_MODE.toLowerCase() === 'yes' && (
                      <RadioBtn
                        data-testid="pyret-activity-filter"
                        check={() => toggleFilter('room-pyret')}
                        checked={filters.roomType === 'pyret'}
                        name="PyretActivity"
                      >
                        Pyret
                      </RadioBtn>
                    )}
                </div>
              </InfoBox>
            ) : null}
            <InfoBox
              title="Time Period -- Last Updated More Than"
              icon={<i className="fas fa-filter" />}
            >
              <Fragment>
                <div className={classes.FilterOpts}>
                  <RadioBtn
                    data-testid="all"
                    check={() => toggleFilter('moreThan-all')}
                    checked={dateRangePreset === 'all'}
                    name="all"
                  >
                    All
                  </RadioBtn>
                  <RadioBtn
                    data-testid="day"
                    check={() => toggleFilter('moreThan-afterDay')}
                    checked={dateRangePreset === 'afterDay'}
                    name="oneDay"
                  >
                    1 Day
                  </RadioBtn>
                  <RadioBtn
                    data-testid="one-week"
                    check={() => toggleFilter('moreThan-afterWeek')}
                    checked={dateRangePreset === 'afterWeek'}
                    name="oneWeek"
                  >
                    1 Week
                  </RadioBtn>
                  <RadioBtn
                    data-testid="two-weeks"
                    check={() => toggleFilter('moreThan-after2Weeks')}
                    checked={dateRangePreset === 'after2Weeks'}
                    name="two-weeks"
                  >
                    2 Weeks
                  </RadioBtn>
                  <RadioBtn
                    data-testid="one-month"
                    check={() => toggleFilter('moreThan-afterMonth')}
                    checked={dateRangePreset === 'afterMonth'}
                    name="one-month"
                  >
                    1 Month
                  </RadioBtn>
                  <RadioBtn
                    data-testid="one-year"
                    check={() => toggleFilter('moreThan-afterYear')}
                    checked={dateRangePreset === 'afterYear'}
                    name="one-year"
                  >
                    1 Year
                  </RadioBtn>
                  <RadioBtn
                    data-testid="custom"
                    check={() => toggleFilter('custom')}
                    checked={dateRangePreset === 'custom'}
                    name="custom"
                  >
                    Custom
                  </RadioBtn>
                </div>
                {dateRangePreset === 'custom' ? (
                  <div className={classes.CustomDateInputs}>
                    <div className={classes.CustomFromDate}>
                      <h3>From Date</h3>
                      <DatePicker
                        selected={customFromDate}
                        onChange={setFromDate}
                        popperPlacement="bottom"
                        shouldCloseOnSelect
                      />
                    </div>
                    <div className={classes.CustomToDate}>
                      <h3>To Date</h3>
                      <DatePicker
                        selected={customToDate}
                        onChange={setToDate}
                        popperPlacement="bottom"
                        shouldCloseOnSelect
                      />
                    </div>
                  </div>
                ) : null}
              </Fragment>
            </InfoBox>
          </div>
        </div>
        <div
          className={classes.List}
          // style={{
          //   marginTop: header.current
          //     ? header.current.getBoundingClientRect().height
          //     : 260,
          // }}
        >
          {/* Check to see if visibleResources is undef, which is the loading state */}
          {loading ? (
            <div className={classes.Pending}>
              Loading
              <span className={classes.dot1}>.</span>
              <span className={classes.dot2}>.</span>
              <span className={classes.dot3}>.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <SelectableBoxList
                list={visibleResources}
                resource={resource}
                listType="public"
                selectable
                icons={icons}
                selectActions={selectActions}
              />
              <div className={classes.LoadMore}>
                <Button
                  m={20}
                  disabled={!moreAvailable}
                  click={() => {
                    onLoadMore(() =>
                      window.scrollTo(0, document.body.scrollHeight)
                    );
                  }}
                >
                  load more results
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

Archive.propTypes = {
  visibleResources: PropTypes.arrayOf(PropTypes.shape({})),
  resource: PropTypes.string.isRequired,
  searchValue: PropTypes.string,
  onLoadMore: PropTypes.func,
  setCriteria: PropTypes.func.isRequired,
  moreAvailable: PropTypes.bool.isRequired,
  filters: PropTypes.shape({
    roomType: PropTypes.string,
  }).isRequired,
  toggleFilter: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  onTabChange: PropTypes.func.isRequired,
  dateRangePreset: PropTypes.string.isRequired,
  customFromDate: PropTypes.instanceOf(Date),
  customToDate: PropTypes.instanceOf(Date),
  setToDate: PropTypes.func.isRequired,
  setFromDate: PropTypes.func.isRequired,
  icons: PropTypes.arrayOf(PropTypes.shape({})),
  selectActions: PropTypes.arrayOf(PropTypes.shape({})),
  actionComponent: PropTypes.node,
};

Archive.defaultProps = {
  visibleResources: [],
  searchValue: '',
  onLoadMore: () => {},
  customFromDate: null,
  customToDate: null,
  actionComponent: null,
  icons: [],
  selectActions: [],
};

export default Archive;
