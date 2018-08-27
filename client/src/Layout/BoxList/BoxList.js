import React from 'react';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import { Link } from 'react-router-dom';
import classes from './boxList.css';
import glb from '../../global.css';
const boxList = props => {
  let listElems = "There doesn't appear to be anything here yet";
  if (props.list.length > 0) {
    listElems = props.list.map((item, i)=> {
      let notifications = 0;
      if (props.notifications) {
        props.notifications.access.forEach((ntf) => {
          if (ntf._id === item._id) {
            notifications += 1;
          }
        })
      }
      return (<div className={classes.ContentBox} key={i}>
        <ContentBox
          title={<Link className={glb.Link} to={`${props.linkPath}${item._id}${props.linkSuffix}`} key={item._id}>{item.name}</Link>}
          notifications={notifications}
          roomType={item.roomType}
          locked={!item.isPublic} // @TODO Should it appear locked if the user has access ? I can see reasons for both
        >
          {item.description}
        </ContentBox>
      </div>)
      })
  }
  return <div className={classes.Container}>{listElems}</div>;
}


export default boxList;
