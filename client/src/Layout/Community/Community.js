import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { BoxList } from 'Layout';
import { Search, CustomLink, Button, RadioBtn, InfoBox } from 'Components';
import { TabTypes } from 'Model';
import classes from './community.css';

class Community extends Component {
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
      setCriteria,
      toggleFilter,
      searchValue,
      loading,
    } = this.props;
    return (
      <div className={classes.Container}>
        <div className={classes.Header} ref={this.header}>
          <h3 className={classes.Title}>
            Search for Templates or ask to join Rooms and Courses
          </h3>
          <div className={classes.ResourceOpts} data-testid="resource-tabs">
            <div>
              <CustomLink to="/community/rooms?privacy=all&roomType=all">
                Rooms
              </CustomLink>
            </div>
            <div>
              <CustomLink to="/community/activities?privacy=all&roomType=all">
                Templates
              </CustomLink>
            </div>
            <div>
              <CustomLink to="/community/courses?privacy=all">
                Courses
              </CustomLink>
            </div>
          </div>
          <div className={classes.Search}>
            <Search
              isControlled
              value={searchValue}
              _search={(value) => setCriteria(value)}
              placeholder="Search by name, description, or facilitators..."
              data-testid="community-search"
            />
          </div>
          <div className={classes.Filters}>
            {/* <i className={['fas fa-sliders-h', classes.FilterIcon].join(' ')} /> */}
            <InfoBox
              title="Privacy Setting"
              icon={<i className="fas fa-filter" />}
            >
              <div className={classes.FilterOpts}>
                <RadioBtn
                  data-testid="all-privacy-filter"
                  check={() => toggleFilter('all-privacySetting')}
                  checked={filters.privacySetting === 'all'}
                  name="All-privacy"
                >
                  All
                </RadioBtn>
                <RadioBtn
                  data-testid="public-filter"
                  check={() => toggleFilter('public')}
                  checked={filters.privacySetting === 'public'}
                  name="Public"
                >
                  Public
                </RadioBtn>
                <RadioBtn
                  data-testid="private-filter"
                  check={() => toggleFilter('private')}
                  checked={filters.privacySetting === 'private'}
                  name="Private"
                >
                  Private
                </RadioBtn>
              </div>
            </InfoBox>
            <div className={classes.RoomTypeLoadMoreContainer}>
              {resource !== 'courses' ? (
                <InfoBox
                  title="Room Type"
                  icon={<i className="fas fa-filter" />}
                >
                  <div className={classes.FilterOpts}>
                    <RadioBtn
                      data-testid="all-roomType-filter"
                      check={() => toggleFilter('all-roomType')}
                      checked={filters.roomType === 'all'}
                      name="All-roomType"
                    >
                      All
                    </RadioBtn>
                    <TabTypes.RadioButtons
                      onClick={toggleFilter}
                      checked={filters.roomType}
                    />
                  </div>
                </InfoBox>
              ) : null}
              <div className={classes.LoadMore}>
                <Button
                  m={20}
                  disabled={!moreAvailable || loading}
                  click={setSkip}
                >
                  load more results
                </Button>
              </div>
            </div>
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
                linkPath={linkPath}
                linkSuffix={linkSuffix}
                listType="public"
              />
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

Community.propTypes = {
  resource: PropTypes.string.isRequired,
  visibleResources: PropTypes.arrayOf(PropTypes.shape({})),
  linkPath: PropTypes.string.isRequired,
  linkSuffix: PropTypes.string.isRequired,
  searchValue: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    privacySetting: PropTypes.oneOf(['public', 'private', 'all']),
    roomType: PropTypes.oneOf([
      'geogebra',
      'desmos',
      'desmosActivity',
      'pyret',
      'all',
    ]),
  }).isRequired,
  toggleFilter: PropTypes.func.isRequired,
  setSkip: PropTypes.func.isRequired,
  moreAvailable: PropTypes.bool.isRequired,
  setCriteria: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

Community.defaultProps = {
  visibleResources: undefined,
  loading: false,
};

export default Community;
