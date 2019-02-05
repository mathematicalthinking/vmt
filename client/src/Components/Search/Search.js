import React, { Component } from "react";
import classes from "./search.css";
class Search extends Component {
  constructor(props) {
    super(props);
    this.searchRef = React.createRef();
  }
  componentDidMount() {
    this.searchRef.current.focus();
  }
  render() {
    return (
      <div className={[classes.Search].join(" ")}>
        <input
          ref={this.searchRef}
          data-testid={this.props["data-testid"]}
          className={[classes.Input, classes[this.props.theme]].join(" ")}
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
