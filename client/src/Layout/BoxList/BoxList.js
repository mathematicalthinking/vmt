import React from 'react';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import { Link } from 'react-router-dom';
import classes from './boxList.css';
import glb from '../../global.css';
const boxList = props => {
  console.log(props)
  const listElems = props.list.map((item, i)=> {
    let notifications = 0;
    // attach notification icon to the box if it has active notifications
    if (props.notifications && item.notifications) {
      notifications = item.notifications.length
    }
    let linkPath = props.dashboard ? '/dashboard' : '';
    if (props.course) { linkPath += `/course/${props.course}`}
    return (<div className={classes.ContentBox} key={i}>
      <ContentBox
        title={<Link className={glb.Link} to={`${linkPath}/${props.resource}/${item._id}`} key={item._id}>{item.name}</Link>}
        notifications={notifications}
      >
        {item.description}
      </ContentBox>
    </div>)
  })
  return <div className={classes.Container}>{listElems}</div>
}


export default boxList;
