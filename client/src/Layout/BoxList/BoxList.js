import React from 'react';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import DragContentBox from '../../Components/UI/ContentBox/DragContentBox';
import { Link } from 'react-router-dom';
import classes from './boxList.css';
import glb from '../../global.css';
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
          teachers: item.members ? item.members.filter(member => member.type === 'teacher') : [],
          entryCode: item.entryCode,
          description: item.description,
        }
      }
      return (
        <div className={classes.ContentBox} key={i}>
          {!props.draggable ? <ContentBox
            title={<Link className={glb.Link} to={`${props.linkPath}${item._id}${props.linkSuffix}`}>{item.name}</Link>}
            key={item._id}
            notifications={notifications}
            roomType={item.roomType}
            locked={!item.isPublic} // @TODO Should it appear locked if the user has access ? I can see reasons for both
            details={details}
                              >
            {item.description}
          </ContentBox> :
          <DragContentBox
            title={<Link className={glb.Link} to={`${props.linkPath}${item._id}${props.linkSuffix}`}>{item.name}</Link>}
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
