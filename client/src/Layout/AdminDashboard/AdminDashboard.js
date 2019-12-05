import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import DashboardBoxList from '../DashboardBoxList/DashboardBoxList';
import {
  // Search,
  CustomLink,
  Button,
  RadioBtn,
  InfoBox,
} from '../../Components';
// import Button from '../../Components/UI/Button/Button';
import classes from './adminDashboard.css';

class AdminDashboard extends Component {
  header = React.createRef();
  debouncedResizeListener = debounce(() => this.forceUpdate(), 1000);

  componentDidMount() {
    window.addEventListener('resize', this.debouncedResizeListener);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedResizeListener);
  }
  render() {
    const {
      resource,
      visibleResources,
      linkPath,
      linkSuffix,
      // filters,
      moreAvailable,
      setSkip,
      // setCriteria,
      toggleFilter,
      // searchValue,
      totalCounts,
      setSinceDate,
      dateRangePreset,
      customSinceDate,
      customToDate,
      setToDate,
    } = this.props;

    const totalCount = totalCounts ? totalCounts.totalCount || 0 : 0;
    let displayResource;
    let resultsMessage;
    const hasHave = totalCount === 1 ? 'has' : 'have';

    if (resource === 'rooms') {
      displayResource = totalCount === 1 ? 'room' : 'rooms';

      resultsMessage = `A total of ${totalCount} ${displayResource} ${hasHave} been updated within the selected time period. To be considered updated, either one or more room details, such as name, instructions, members, were updated, or one or more events and/or messages were created.`;
    } else if (resource === 'users') {
      displayResource = totalCount === 1 ? 'user' : 'users';
      resultsMessage = `A total of ${totalCount} ${displayResource} ${hasHave} been active within the selected time period. "Active" in this case means that the user made a network request while logged in.`;
    }
    return (
      <div className={classes.Container}>
        <div className={classes.Header} ref={this.header}>
          <h3 className={classes.Title}>See Recently Active Rooms and Users</h3>
          <div className={classes.ResourceOpts} data-testid="resource-tabs">
            <div>
              <CustomLink to="/dashboard/rooms?since=day">Rooms</CustomLink>
            </div>
            <div>
              <CustomLink to="/dashboard/users?since=day">Users</CustomLink>
            </div>
          </div>
          {/* <div className={classes.Search}>
            <Search
              isControlled
              value={searchValue}
              _search={(value) => setCriteria(value)}
              placeholder="Search by name, description, or facilitators..."
              data-testid="community-search"
            />
          </div> */}
          <div className={classes.Filters}>
            {/* <i className={['fas fa-sliders-h', classes.FilterIcon].join(' ')} /> */}
            <InfoBox title="Time Period" icon={<i className="fas fa-filter" />}>
              <div className={classes.FilterOpts}>
                <RadioBtn
                  data-testid="last-day"
                  check={() => toggleFilter('last-day')}
                  checked={dateRangePreset === 'day'}
                  name="last-day"
                >
                  Last Day
                </RadioBtn>
                <RadioBtn
                  data-testid="last-week"
                  check={() => toggleFilter('last-week')}
                  checked={dateRangePreset === 'week'}
                  name="last-week"
                >
                  Last Week
                </RadioBtn>
                <RadioBtn
                  data-testid="last-month"
                  check={() => toggleFilter('last-month')}
                  checked={dateRangePreset === 'month'}
                  name="last-month"
                >
                  Last Month
                </RadioBtn>
                <RadioBtn
                  data-testid="last-year"
                  check={() => toggleFilter('last-year')}
                  checked={dateRangePreset === 'year'}
                  name="last-year"
                >
                  Last Year
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
                  <div className={classes.CustomSinceDate}>
                    <h3>Since Date</h3>
                    <DatePicker
                      selected={customSinceDate}
                      onChange={setSinceDate}
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
            </InfoBox>
          </div>
        </div>
        <div
          className={classes.List}
          style={{
            marginTop: this.header.current
              ? this.header.current.getBoundingClientRect().height
              : 260,
          }}
        >
          <DashboardBoxList
            list={visibleResources}
            resource={resource}
            linkPath={linkPath}
            linkSuffix={linkSuffix}
            listType="public"
            resultsMessage={resultsMessage}
          />
          <div className={classes.LoadMore}>
            <Button m={20} disabled={!moreAvailable} click={setSkip}>
              load more results
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

AdminDashboard.defaultProps = {
  linkPath: null,
  linkSuffix: null,
  totalCounts: null,
  customSinceDate: null,
  customToDate: null,
};

AdminDashboard.propTypes = {
  resource: PropTypes.string.isRequired,
  visibleResources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  linkPath: PropTypes.string,
  linkSuffix: PropTypes.string,
  // searchValue: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    privacySetting: PropTypes.oneOf(['public', 'private', 'all']),
    roomType: PropTypes.oneOf(['geogebra', 'desmos', 'all']),
  }).isRequired,
  toggleFilter: PropTypes.func.isRequired,
  setSkip: PropTypes.func.isRequired,
  moreAvailable: PropTypes.bool.isRequired,
  // setCriteria: PropTypes.func.isRequired,
  totalCounts: PropTypes.shape({ totalCount: PropTypes.number }),
  setSinceDate: PropTypes.func.isRequired,
  dateRangePreset: PropTypes.bool.isRequired,
  customSinceDate: PropTypes.string,
  customToDate: PropTypes.string,
  setToDate: PropTypes.func.isRequired,
};

export default AdminDashboard;
