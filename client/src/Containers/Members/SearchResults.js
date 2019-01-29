import React from 'react';
import { Avatar, Button } from '../../Components/';
import classes from './members.css';
export default function SearchResults({usersSearched, addUser}) {
  return (
    <ul className={classes.SearchResults}>
      {usersSearched.map(user => {
        return <li className={classes.SearchResItem}>
          <Avatar username={user}/>
          <Button click={addUser}>Add</Button>
        </li>
      })}
    </ul>
  )
}