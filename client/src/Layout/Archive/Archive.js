import React, { useRef, Fragment } from 'react';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';
import { BoxList } from 'Layout';
import {
  Search,
  CustomLink,
  Button,
  RadioBtn,
  InfoBox,
  Checkbox,
} from 'Components';
import classes from './archive.css';

const Archive = (props) => {
  const {
    visibleResources,
    resource,
    searchValue,
    setSkipState,
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
    handleSelectAll,
    selectAllChecked,
    selectedIds,
    onSelect,
    icons,
    showRoomPreview,
    roomPreviewComponent,
    showRestoreComponent,
    restoreComponent,
  } = props;

  const header = useRef();

  return (
    <React.Fragment>
      {showRoomPreview && roomPreviewComponent}
      {showRestoreComponent && restoreComponent}

      <div className={classes.Container}>
        <div className={classes.Header} ref={header}>
          <h3 className={classes.Title}>
            Search for your archived Rooms and Courses
          </h3>
          <div className={classes.ResourceOpts} data-testid="resource-tabs">
            <div
              onClick={onTabChange}
              onKeyDown={onTabChange}
              tabIndex={-1}
              role="button"
            >
              <CustomLink to="/archive/rooms?&roomType=all">Rooms</CustomLink>
            </div>
            <div
              onClick={onTabChange}
              onKeyDown={onTabChange}
              tabIndex={-1}
              role="button"
            >
              <CustomLink to="/archive/courses?">Courses</CustomLink>
            </div>
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
              title="Time Period -- More Than"
              icon={<i className="fas fa-filter" />}
            >
              <Fragment>
                <div className={classes.FilterOpts}>
                  <RadioBtn
                    data-testid="day"
                    check={() => toggleFilter('moreThan-oneDay')}
                    checked={dateRangePreset === 'oneDay'}
                    name="oneDay"
                  >
                    1 Day
                  </RadioBtn>
                  <RadioBtn
                    data-testid="one-week"
                    check={() => toggleFilter('moreThan-oneWeek')}
                    checked={dateRangePreset === 'oneWeek'}
                    name="oneWeek"
                  >
                    1 Week
                  </RadioBtn>
                  <RadioBtn
                    data-testid="two-weeks"
                    check={() => toggleFilter('moreThan-twoWeeks')}
                    checked={dateRangePreset === 'twoWeeks'}
                    name="two-weeks"
                  >
                    2 Weeks
                  </RadioBtn>
                  <RadioBtn
                    data-testid="one-month"
                    check={() => toggleFilter('moreThan-oneMonth')}
                    checked={dateRangePreset === 'oneMonth'}
                    name="one-month"
                  >
                    1 Month
                  </RadioBtn>
                  <RadioBtn
                    data-testid="one-year"
                    check={() => toggleFilter('moreThan-oneYear')}
                    checked={dateRangePreset === 'oneYear'}
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
          <div style={{ display: 'flex' }}>
            <Checkbox
              change={handleSelectAll}
              checked={selectAllChecked}
              dataId="select-all"
            >
              Select All
            </Checkbox>
            <Button
              click={() => {
                console.log('restore');
              }}
              disabled={selectedIds.length === 0}
              m={'0 1rem'}
            >
              Restore
            </Button>
          </div>
        </div>
        <div
          className={classes.List}
          style={{
            marginTop: header.current
              ? header.current.getBoundingClientRect().height
              : 260,
          }}
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
            <Fragment>
              <BoxList
                list={visibleResources}
                resource={resource}
                listType="public"
                selectable
                selectedIds={selectedIds}
                onSelect={onSelect}
                icons={icons}
              />
              <div className={classes.LoadMore}>
                <Button m={20} disabled={!moreAvailable} click={setSkipState}>
                  load more results
                </Button>
              </div>
            </Fragment>
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
  setSkipState: PropTypes.func,
  setCriteria: PropTypes.func.isRequired,
  moreAvailable: PropTypes.bool.isRequired,
  filters: PropTypes.shape({}).isRequired,
  toggleFilter: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  onTabChange: PropTypes.func.isRequired,
  dateRangePreset: PropTypes.string.isRequired,
  customFromDate: PropTypes.string,
  customToDate: PropTypes.string,
  setToDate: PropTypes.func.isRequired,
  setFromDate: PropTypes.func.isRequired,
  handleSelectAll: PropTypes.func.isRequired,
  selectAllChecked: PropTypes.bool.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string),
  onSelect: PropTypes.func.isRequired,
  icons: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  showRoomPreview: PropTypes.bool.isRequired,
  roomPreviewComponent: PropTypes.func,
  showRestoreComponent: PropTypes.bool.isRequired,
  restoreComponent: PropTypes.func,
};

Archive.defaultProps = {
  visibleResources: [],
  searchValue: '',
  setSkipState: null,
  customFromDate: null,
  customToDate: null,
  selectedIds: [],
  roomPreviewComponent: null,
  restoreComponent: null,

};

export default Archive;