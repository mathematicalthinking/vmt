import React, { Component } from "react";
// import { CustomLink } from 'react-router-dom';
import BoxList from "../BoxList/BoxList";
import { Search, CustomLink, Button, RadioBtn } from "../../Components/";
// import Button from '../../Components/UI/Button/Button';
import classes from "./community.css";
class Community extends Component {
  render() {
    const {
      resource,
      visibleResources,
      linkPath,
      linkSuffix,
      filters,
      toggleFilter
    } = this.props;

    console.log("FILTERS ", filters);
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
            <Search
              _search={value => this.props.setCriteria(value)}
              placeholder={"Search..."}
            />
          </div>
          <div className={classes.Filter}>
            <i className={["fas fa-sliders-h", classes.FilterIcon].join(" ")} />
            <div className={classes.FilterGroup}>
              <RadioBtn
                check={() => toggleFilter("Public")}
                checked={filters.indexOf("Public") > -1}
                name={"Public"}
              >
                Public
              </RadioBtn>
              <RadioBtn
                check={() => toggleFilter("Private")}
                checked={filters.indexOf("Private") > -1}
                name={"Private"}
              >
                Private
              </RadioBtn>
            </div>
            <div className={classes.FilterGroup}>
              <RadioBtn
                check={() => toggleFilter("Geogebra")}
                checked={filters.indexOf("Geogebra") > -1}
                name={"Geogebra"}
              >
                GeoGebra
              </RadioBtn>
              <RadioBtn
                check={() => toggleFilter("Desmos")}
                checked={filters.indexOf("Desmos") > -1}
                name={"Desmos"}
              >
                Desmos
              </RadioBtn>
            </div>
            <div className={classes.FilterGroup}>
              <Button>clear all filters</Button>
            </div>
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
