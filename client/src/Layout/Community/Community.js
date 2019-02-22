import React, { Component } from "react";
// import { CustomLink } from 'react-router-dom';
import BoxList from "../BoxList/BoxList";
import { Search, CustomLink, Button, RadioBtn } from "../../Components/";
// import Button from '../../Components/UI/Button/Button';
import classes from "./community.css";
class Community extends Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps === this.props) {
      return false;
    } else return true;
  }
  render() {
    const {
      resource,
      visibleResources,
      linkPath,
      linkSuffix,
      filters,
      toggleFilter
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
            <Search
              _search={value => this.props.setCriteria(value)}
              placeholder={"Search..."}
            />
          </div>
          <div className={classes.Filter}>
            <i className={["fas fa-sliders-h", classes.FilterIcon].join(" ")} />
            <div className={classes.FilterGroup}>
              <RadioBtn
                check={() => toggleFilter("public")}
                checked={filters.privacySetting === "public"}
                name={"Public"}
              >
                Public
              </RadioBtn>
              <RadioBtn
                check={() => toggleFilter("private")}
                checked={filters.privacySetting === "private"}
                name={"Private"}
              >
                Private
              </RadioBtn>
            </div>
            {resource !== "courses" ? (
              <div className={classes.FilterGroup}>
                <RadioBtn
                  check={() => toggleFilter("geogebra")}
                  checked={filters.roomType === "geogebra"}
                  name={"Geogebra"}
                >
                  GeoGebra
                </RadioBtn>
                <RadioBtn
                  check={() => toggleFilter("desmos")}
                  checked={filters.roomType === "desmos"}
                  name={"Desmos"}
                >
                  Desmos
                </RadioBtn>
              </div>
            ) : null}
            <div className={classes.FilterGroup}>
              <Button click={() => toggleFilter(null, true)}>
                clear all filters
              </Button>
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
