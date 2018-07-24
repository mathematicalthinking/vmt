import React from 'react';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import { Link } from 'react-router-dom';
import classes from './boxList.css';
import glb from '../../global.css';
const boxList = props => {
  const listElems = props.list.map(item => (
    <div className={classes.ContentBox} key={item._id}>
      <ContentBox title={<Link className={glb.Link} to={`/${props.resource}/${item._id}`} key={item._id}>{item.name}</Link>}>
        {item.description}
      </ContentBox>
    </div>
  ))
  return <div className={classes.Container}>{listElems}</div>
}


export default boxList;
