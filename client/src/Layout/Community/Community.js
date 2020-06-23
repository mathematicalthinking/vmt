import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
// import { CustomLink } from 'react-router-dom';
import BoxList from '../BoxList/BoxList';
import {
  Search,
  CustomLink,
  Button,
  RadioBtn,
  InfoBox,
} from '../../Components';
// import Button from '../../Components/UI/Button/Button';
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
      user,
    } = this.props;

    const roomStatusInfoBox = user.isAdmin ? (
      <InfoBox title="Room Status" icon={<i className="fas fa-filter" />}>
        <div className={classes.FilterOpts}>
          <RadioBtn
            data-testid="all-roomStatus-filter"
            check={() => toggleFilter('default-roomStatus')}
            checked={filters.roomStatus === 'default'}
            name="Default-roomStatus"
          >
            Active
          </RadioBtn>
          <RadioBtn
            data-testid="archived-roomStatus-filter"
            check={() => toggleFilter('isArchived')}
            checked={filters.roomStatus === 'isArchived'}
            name="isArchived"
          >
            Archived
          </RadioBtn>
          <RadioBtn
            data-testid="trashed-roomStatus-filter"
            check={() => toggleFilter('isTrashed')}
            checked={filters.roomStatus === 'isTrashed'}
            name="isTrashed"
          >
            Trashed
          </RadioBtn>
        </div>
      </InfoBox>
    ) : (
      <InfoBox title="Room Status" icon={<i className="fas fa-filter" />}>
        <div className={classes.FilterOpts}>
          <RadioBtn
            data-testid="all-roomStatus-filter"
            check={() => toggleFilter('default-roomStatus')}
            checked={filters.roomStatus === 'default'}
            name="Default-roomStatus"
          >
            Active
          </RadioBtn>
          <RadioBtn
            data-testid="archived-roomStatus-filter"
            check={() => toggleFilter('isArchived')}
            checked={filters.roomStatus === 'isArchived'}
            name="isArchived"
          >
            Archived
          </RadioBtn>
        </div>
      </InfoBox>
    );

    return (
      <div className={classes.Container}>
        <div className={classes.Header} ref={this.header}>
          <h3 className={classes.Title}>
            search for activities or ask to join rooms and courses
          </h3>
          <div className={classes.ResourceOpts} data-testid="resource-tabs">
            <div>
              <CustomLink to="/community/rooms?privacy=all&roomType=all&roomStatus=default">
                Rooms
              </CustomLink>
            </div>
            <div>
              <CustomLink to="/community/activities?privacy=all&roomType=all">
                Activities
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
              roomStatus=""
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
            {resource !== 'courses' ? (
              <InfoBox title="Room Type" icon={<i className="fas fa-filter" />}>
                <div className={classes.FilterOpts}>
                  <RadioBtn
                    data-testid="all-roomType-filter"
                    check={() => toggleFilter('all-roomType')}
                    checked={filters.roomType === 'all'}
                    name="All-roomType"
                  >
                    All
                  </RadioBtn>
                  <RadioBtn
                    data-testid="geogebra-filter"
                    check={() => toggleFilter('geogebra')}
                    checked={filters.roomType === 'geogebra'}
                    name="GeoGebra"
                  >
                    GeoGebra
                  </RadioBtn>
                  <RadioBtn
                    data-testid="desmos-filter"
                    check={() => toggleFilter('desmos')}
                    checked={filters.roomType === 'desmos'}
                    name="Desmos"
                  >
                    Desmos
                  </RadioBtn>
                </div>
              </InfoBox>
            ) : null}
            {resource === 'rooms' ? roomStatusInfoBox : null}
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

Community.propTypes = {
  resource: PropTypes.string.isRequired,
  visibleResources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  linkPath: PropTypes.string.isRequired,
  linkSuffix: PropTypes.string.isRequired,
  searchValue: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    privacySetting: PropTypes.oneOf(['public', 'private', 'all']),
    roomType: PropTypes.oneOf(['geogebra', 'desmos', 'all']),
    roomStatus: PropTypes.oneOf(['default', 'isArchived', 'isTrashed']),
  }).isRequired,
  toggleFilter: PropTypes.func.isRequired,
  setSkip: PropTypes.func.isRequired,
  moreAvailable: PropTypes.bool.isRequired,
  setCriteria: PropTypes.func.isRequired,
  user: PropTypes.shape({}).isRequired,
};

export default Community;
