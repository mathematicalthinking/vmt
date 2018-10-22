import React from 'react';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import DragContentBox from '../../Components/UI/ContentBox/DragContentBox';

import classes from './boxList.css';
const boxList = props => {
  let listElems = "There doesn't appear to be anything here yet";
  if (props.list.length > 0) {
    listElems = props.list.map((item, i) => {
      let notifications = 0;
      let details = undefined;
      if (props.listType === 'private') {
        if (props.notifications.length > 0) {
          props.notifications.forEach((ntf) => {
            if (ntf._id === item._id) {
              notifications += 1;
            }
          })
        }
        details = {
          entryCode: item.entryCode,
          description: item.description,
          facilitators: [],
        }
      } else {
        details = {
          facilitators: item.members ? item.members.reduce((acc, member) => {

            if (member.role === 'facilitator') acc.push(member.user.username);
            return acc;
          }, []) : []
        }
      }
      console.log(item.members)
      console.log(details.facilitators)
      return (
        <div className={classes.ContentBox} key={i}>
          {!props.draggable ? <ContentBox
            title={item.name}
            link={`${props.linkPath}${item._id}${props.linkSuffix}`}
            key={item._id}
            image={item.image}
            notifications={notifications}
            roomType={item.roomType}
            locked={!item.isPublic} // @TODO Should it appear locked if the user has access ? I can see reasons for both
            details={details}
                              >
            {item.description}
          </ContentBox> :
          <DragContentBox
            title={item.name}
            link={`${props.linkPath}${item._id}${props.linkSuffix}`}
            key={item._id}
            id={item._id}
            notifications={notifications}
            roomType={item.roomType}
            resource={props.resource}
            locked={!item.isPublic} // @TODO Should it appear locked if the user has access ? I can see reasons for both
            details={details}
          >
          </DragContentBox>
          }
        </div>
      )
    })
  }
  return <div className={classes.Container}>{listElems}</div>;
}


export default boxList;
