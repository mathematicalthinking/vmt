import React, { Component } from 'react';
import classes from './trash.css';
export default class Trash extends Component {
  render() {
    return (
      <div className={classes.Trash}><i class="far fa-trash-alt"></i></div>
    )
  }
}
