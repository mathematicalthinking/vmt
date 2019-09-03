import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { CustomLink } from 'react-router-dom';
import BoxList from '../BoxList/BoxList';
import {
  Search,
  CustomLink,
  Button,
  RadioBtn,
  BreadCrumbs,
  InfoBox,
} from '../../Components';
// import Button from '../../Components/UI/Button/Button';
import classes from './community.css';

class Community extends Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps === this.props) {
      return false;
    }
    return true;
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
    } = this.props;
    console.log({ filters });
    return (
      <div className={classes.Container}>
        <div className={classes.Header}>
          <BreadCrumbs
            crumbs={[{ link: '/community/rooms', title: 'Community' }]}
          />
          <h3 className={classes.Title}>
            search for activities or ask to join rooms and courses
          </h3>
          <div className={classes.ResourceOpts}>
            <div>
              <CustomLink to="/community/rooms">Rooms</CustomLink>
            </div>
            <div>
              <CustomLink to="/community/activities">Activities</CustomLink>
            </div>
            <div>
              <CustomLink to="/community/courses">Courses</CustomLink>
            </div>
          </div>
          <div className={classes.Search}>
            <Search
              _search={(value) => setCriteria(value)}
              placeholder="Search..."
              data-testid="community-search"
            />
          </div>
          <div className={classes.Filters}>
            {/* <i className={['fas fa-sliders-h', classes.FilterIcon].join(' ')} /> */}
            <InfoBox title="Privacy Setting">
              <div className={classes.FilterOpts}>
                <RadioBtn
                  check={() => toggleFilter('all')}
                  checked={filters.privacySetting === 'all'}
                  name="All-privacy"
                >
                  All
                </RadioBtn>
                <RadioBtn
                  check={() => toggleFilter('public')}
                  checked={filters.privacySetting === 'public'}
                  name="Public"
                >
                  Public
                </RadioBtn>
                <RadioBtn
                  check={() => toggleFilter('private')}
                  checked={filters.privacySetting === 'private'}
                  name="Private"
                >
                  Private
                </RadioBtn>
              </div>
            </InfoBox>
            {resource !== 'courses' ? (
              <InfoBox title="Room Type">
                <div className={classes.FilterOpts}>
                  <RadioBtn
                    check={() => toggleFilter('all')}
                    checked={filters.roomType === 'all'}
                    name="All-roomType"
                  >
                    All
                  </RadioBtn>
                  <RadioBtn
                    check={() => toggleFilter('geogebra')}
                    checked={filters.roomType === 'geogebra'}
                    name="GeoGebra"
                  >
                    GeoGebra
                  </RadioBtn>
                  <RadioBtn
                    check={() => toggleFilter('desmos')}
                    checked={filters.roomType === 'desmos'}
                    name="Desmos"
                  >
                    Desmos
                  </RadioBtn>
                </div>
              </InfoBox>
            ) : null}
          </div>
        </div>
        <div className={classes.List}>
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
  filters: PropTypes.shape({
    privacySetting: PropTypes.oneOf(['public', 'private']),
    roomType: PropTypes.oneOf(['geogebra', 'desmos']),
  }).isRequired,
  toggleFilter: PropTypes.func.isRequired,
  setSkip: PropTypes.func.isRequired,
  moreAvailable: PropTypes.bool.isRequired,
  setCriteria: PropTypes.func.isRequired,
};

export default Community;
