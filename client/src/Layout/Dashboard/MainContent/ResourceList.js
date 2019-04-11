import React, { Fragment } from "react";
import BoxList from "../../BoxList/BoxList";
import NewResource from "../../../Containers/Create/NewResource/NewResource";
import classes from "./resourceList.css";
import Search from "../../../Components/Search/Search";
// CONSIDER RENAMING TO DASHBOARDCONTENT
const resources = props => {
  let linkPath = `/myVMT/${props.resource}/`;
  let linkSuffix;
  if (props.resource === "courses") {
    linkSuffix = "/activities";
  } else {
    linkSuffix = "/details";
  }
  const displayResource =
    props.resource[0].toUpperCase() + props.resource.slice(1);
  if (props.parentResource === "courses") {
    linkPath = `/myVMT/${props.parentResource}/${props.parentResourceId}/${
      props.resource
    }/`;
    linkSuffix = "/details";
  }

  let create;
  // if (props.resource === 'courses' && props.user.accountType === 'facilitator') {
  //   create = <NewCourse />
  // }
  if (
    props.parentResource !== "activities" &&
    props.user.accountType === "facilitator"
  ) {
    // THIS SHOULD ACTUALLY CHANGE DEPENDING ON states CURRENT ROLE ?? MAYBE
    create = (
      <NewResource
        resource={props.resource}
        courseId={
          props.parentResource === "courses" ? props.parentResourceId : null
        }
      />
    );
  }

  let facilitatorList = [];
  let participantList = [];
  if (props.bothRoles) {
    /** consider storing a field like myRole on the actual resource in the store...we could compute this when its added to the store and then never again
     * I feel like we are checking roles...which requires looping through the resources members each time.
     */
    props.userResources.forEach(resource => {
      resource.members.forEach(member => {
        if (member.user && member.user._id === props.user._id) {
          if (member.role === "participant" || member.role === "guest") {
            participantList.push(resource);
          } else {
            facilitatorList.push(resource);
          }
        }
      });
    });
  }

  return (
    <div>
      {/* @TODO don't show create optinos for participants */}
      <div className={classes.Controls}>
        <div className={classes.Search}>
          <Search />
        </div>
        {create}
      </div>
      {props.bothRoles ? (
        <div className={classes.Row}>
          <div className={classes.Col}>
            <h2 className={classes.ResourceHeader}>
              {displayResource} I Manage
            </h2>
            <BoxList
              list={facilitatorList}
              linkPath={linkPath}
              linkSuffix={linkSuffix}
              notifications={props.notifications}
              resource={props.resource}
              listType="private"
              parentResourec={props.parentResource}
              // draggable
            />
          </div>
          <div className={classes.Col}>
            <h2 className={classes.ResourceHeader}>
              {displayResource} I'm a member of
            </h2>
            <BoxList
              list={participantList}
              linkPath={linkPath}
              linkSuffix={linkSuffix}
              notifications={props.notifications}
              resource={props.resource}
              listType="private"
              parentResourec={props.parentResource}
              // draggable
            />
          </div>
        </div>
      ) : (
        <Fragment>
          <h2 className={classes.ResourceHeader}>{displayResource}</h2>
          <BoxList
            list={props.userResources}
            linkPath={linkPath}
            linkSuffix={linkSuffix}
            notifications={props.notifications}
            resource={props.resource}
            listType="private"
            parentResourec={props.parentResource}
            // draggable
          />
        </Fragment>
      )}
    </div>
  );
};

export default resources;
