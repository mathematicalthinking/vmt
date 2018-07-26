import React from 'react';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import { Link } from 'react-router-dom';
import classes from './boxList.css';
import glb from '../../global.css';
const boxList = props => {
  const listElems = props.list.map(item => {
    let notifications = 0;
    if (props.notifications && item.notifications) {
      notifications = item.notifications.length
    }
    return (<div className={classes.ContentBox} key={item._id}>
      <ContentBox
        title={<Link className={glb.Link} to={`/${props.resource}/${item._id}`} key={item._id}>{item.name}</Link>}
        notifications={notifications}
      >
        {item.description}
      </ContentBox>
    </div>)
  })
  return <div className={classes.Container}>{listElems}</div>
}


export default boxList;
