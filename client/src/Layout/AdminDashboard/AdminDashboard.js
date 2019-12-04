import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
// import { CustomLink } from 'react-router-dom';
import BoxList from '../BoxList/BoxList';
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
      filters,
      moreAvailable,
      setSkip,
      // setCriteria,
      toggleFilter,
      // searchValue,
    } = this.props;
    return (
      <div className={classes.Container}>
        <div className={classes.Header} ref={this.header}>
          <h3 className={classes.Title}>See Recently Active Rooms</h3>
          <div className={classes.ResourceOpts} data-testid="resource-tabs">
            <div>
              <CustomLink to="/dashboard/rooms?since=day">Rooms</CustomLink>
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
            <InfoBox title="Since Date" icon={<i className="fas fa-filter" />}>
              <div className={classes.FilterOpts}>
                <RadioBtn
                  data-testid="since-day"
                  check={() => toggleFilter('since-day')}
                  checked={filters.since === 'day'}
                  name="since-day"
                >
                  Last Day
                </RadioBtn>
                <RadioBtn
                  data-testid="since-week"
                  check={() => toggleFilter('since-week')}
                  checked={filters.since === 'week'}
                  name="since-week"
                >
                  Last Week
                </RadioBtn>
                <RadioBtn
                  data-testid="since-month"
                  check={() => toggleFilter('since-month')}
                  checked={filters.since === 'month'}
                  name="since-month"
                >
                  Last Month
                </RadioBtn>
                <RadioBtn
                  data-testid="since-year"
                  check={() => toggleFilter('since-year')}
                  checked={filters.since === 'year'}
                  name="since-year"
                >
                  Last Year
                </RadioBtn>
                <RadioBtn
                  data-testid="since-custom"
                  check={() => toggleFilter('since-custom')}
                  checked={filters.since === 'custom'}
                  name="since-custom"
                >
                  Custom
                </RadioBtn>
              </div>
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
          <BoxList
            list={visibleResources}
            resource={resource}
            linkPath={linkPath}
            linkSuffix={linkSuffix}
            listType="public"
            isDashboard
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

AdminDashboard.propTypes = {
  resource: PropTypes.string.isRequired,
  visibleResources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  linkPath: PropTypes.string.isRequired,
  linkSuffix: PropTypes.string.isRequired,
  // searchValue: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    privacySetting: PropTypes.oneOf(['public', 'private', 'all']),
    roomType: PropTypes.oneOf(['geogebra', 'desmos', 'all']),
  }).isRequired,
  toggleFilter: PropTypes.func.isRequired,
  setSkip: PropTypes.func.isRequired,
  moreAvailable: PropTypes.bool.isRequired,
  // setCriteria: PropTypes.func.isRequired,
};

export default AdminDashboard;
