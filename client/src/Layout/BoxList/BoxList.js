import React from 'react';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import DragContentBox from '../../Components/UI/ContentBox/DragContentBox';

import classes from './boxList.css';
const boxList = React.memo(props => {
  let listElems = "There doesn't appear to be anything here yet";
  if (props.list.length > 0) {
    listElems = props.list.map((item, i) => {
      if (item) {
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
        return (
          <div className={classes.ContentBox} key={i}>
            {!props.draggable ? <ContentBox
              title={item.name}
              link={`${props.linkPath}${item._id}${props.linkSuffix}`}
              key={item._id}
              id={item._id}
              image={item.image}
              notifications={notifications}
              roomType={item.roomType}
              locked={!item.isPublic} // @TODO Should it appear locked if the user has access ? I can see reasons for both
              details={details}
              listType={props.listType}
              selecting={props.selecting}
              select={props.select}
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
              listType={props.listType}
              locked={!item.isPublic} // @TODO Should it appear locked if the user has access ? I can see reasons for both
              details={details}
            >
            </DragContentBox>
            }
          </div>
        )
      } else return null;
    })
  }
  return <div className={classes.Container} style={props.scrollable ? {maxHeight: props.maxHeight, overflowY: 'scroll', border: '1px solid #ddd', padding: 10} : null} data-testid='box-list'>{listElems}</div>;
})


export default boxList;
