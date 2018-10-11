import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import BoxList from '../BoxList/BoxList';
import Search from '../../Components/Search/Search';
import Button from '../../Components/UI/Button/Button';
import classes from './community.css';
class Community extends Component {
    render() {
      const { resource, visibleResources, linkPath, linkSuffix } = this.props;
      return (
        <div className={classes.Container}>
        <h3 className={classes.Title}>Search for activities or ask to join rooms and courses</h3>
        <div className={classes.ResourceOpts}>
          <Link to="/community/activities"><Button active={resource === 'activities'}>Activities</Button></Link>
          <Link to="/community/courses"><Button active={resource === 'courses'}>Courses</Button></Link>
          <Link to="/community/rooms"><Button active={resource === 'rooms'}>Rooms</Button></Link>
        </div>
        <Search _filter={value => this.filterResults(value)} />
        <div className={classes.List}>
          <BoxList
            list={visibleResources}
            resource={resource}
            linkPath={linkPath}
            linkSuffix={linkSuffix}
          />
        </div>

      </div>
      )
    }
}

export default Community;