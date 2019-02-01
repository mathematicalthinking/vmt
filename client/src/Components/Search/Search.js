import React, { Component } from "react";
import classes from "./search.css";
class Search extends Component {
  componentDidMount() {
    // this.searchRef.focus();
  }
  render() {
    return (
      <div className={classes.Search}>
        <input
          data-testid={this.props["data-testid"]}
          className={classes.Input}
          type="text"
          placeholder={this.props.placeholder}
          onChange={event => this.props._search(event.target.value.trim())}
        />
        <i className={["fas fa-search", classes.Icon].join(" ")} />
      </div>
    );
  }
}

export default Search;
