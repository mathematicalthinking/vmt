import React, { Component } from 'react';
import classes from './search.css'
// Needs to be a class component so that we can add a ref??
// ^^^ IS this true? can we add a ref in a functinal component
class Filter extends Component {
  componentDidMount() {
    this.searchRef.focus();
  }
  render() {
    return (
      <div className={classes.Search}>
        <input ref={input => this.searchRef = input} className={classes.Input} onChange={event => this.props.filter(event.target.value)} />
        <i className={["fas fa-search", classes.Icon].join(' ')}></i>
      </div>
    )
  }
}

export default Filter;
