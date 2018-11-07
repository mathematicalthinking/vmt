import React, { Component } from 'react';
import classes from './search.css'
class Filter extends Component {
  componentDidMount() {
    // this.searchRef.focus();
  }
  render() {
    return (
      <div className={classes.Search}>
        <input className={classes.Input} type="text"/>
        {/* onChange={event => this.props._filter(event.target.value.trim())} */}
        <i className={["fas fa-search", classes.Icon].join(' ')}></i>
      </div>
    )
  }
}

export default Filter;
