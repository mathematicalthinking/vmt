import React from 'react';
import { Avatar, Button } from '../../Components/';
import classes from './members.css';
export default function SearchResults({usersSearched, inviteMember}) {
  return (
    <ul className={classes.SearchResults}>
      {usersSearched.map(user => {
        return <li className={classes.SearchResItem} key={user._id}>
                <div className={classes.FlexRow}><Avatar username={user.username}/> <span className={classes.Email}>{user.email}</span></div>
                <Button click={() => {inviteMember(user._id, user.username)}}>Add</Button>
              </li>
      })}
    </ul>
  )
}