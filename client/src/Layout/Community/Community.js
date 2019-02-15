import React, { Component } from "react";
// import { CustomLink } from 'react-router-dom';
import BoxList from "../BoxList/BoxList";
import { Search, CustomLink, Button } from "../../Components/";
// import Button from '../../Components/UI/Button/Button';
import classes from "./community.css";
class Community extends Component {
  render() {
    const {
      resource,
      visibleResources,
      linkPath,
      linkSuffix,
      select
    } = this.props;
    return (
      <div className={classes.Container}>
        <div className={classes.Header}>
          <h3 className={classes.Title}>
            Search for activities or ask to join rooms and courses
          </h3>
          <div className={classes.ResourceOpts}>
            <div>
              <CustomLink to="/community/activities">Activities</CustomLink>
            </div>
            <div>
              <CustomLink to="/community/courses">Courses</CustomLink>
            </div>
            <div>
              <CustomLink to="/community/rooms">Rooms</CustomLink>
            </div>
          </div>
          <div className={classes.Search}>
            <Search _search={value => this.props.setCriteria(value)} />
          </div>
        </div>
        <div className={classes.List}>
          <BoxList
            list={visibleResources}
            resource={resource}
            linkPath={linkPath}
            linkSuffix={linkSuffix}
            listType="public"
            select={select}
          />
          <div className={classes.LoadMore}>
            <Button
              m={20}
              disabled={!this.props.moreAvailable}
              click={this.props.setSkip}
            >
              load more results
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Community;
