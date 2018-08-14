import React from 'react';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import { Link } from 'react-router-dom';
import classes from './boxList.css';
import glb from '../../global.css';
const boxList = props => {
  console.log(props)
  let listElems = "There doesn't appear to be anything here yet";
  if (props.list.length > 0) {
    listElems = props.list.map((item, i)=> {
      let notifications = 0;
      // attach notification icon to the box if it has active notifications
      if (props.notifications && item.notifications) {
        notifications = item.notifications.length
      }
      return (<div className={classes.ContentBox} key={i}>
        <ContentBox
          title={<Link className={glb.Link} to={`${props.linkPath}${item._id}${props.linkSuffix}`} key={item._id}>{item.name}</Link>}
          notifications={notifications}
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
