//PROPS: title,  list, selectHandler(listOfSelectedItems)

import React, { Component } from "react";
import classes from "./dropdown.css";
import onClickOutside from "react-onclickoutside";
class RoleDropdown extends Component {
  state = {
    listOpen: false,
    selected: []
  };

  handleClickOutside = event => {
    if (this.state.listOpen) {
      this.setState({
        listOpen: false
      });
    }
  };

  toggleList = event => {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen
    }));
  };

  render() {
    let list;
    if (this.props.list.length === 0 || !this.props.list) {
      list = (
        <div className={classes.ErrorItem}>There's nothing in here yet</div>
      );
    } else {
      list = this.props.list.map((item, i) => {
        // check if this item is in state.selected
        let colorClass = classes.ListItem;
        const backgroundClass =
          i % 2 === 0 ? classes.Background1 : classes.Background2;
        const className = [colorClass, backgroundClass].join(" ");
        return (
          <div
            key={i}
            onClick={event => {
              this.setState({ listOpen: false });
              this.props.selectHandler(item);
            }}
            className={className}
            data-testid="dropdown-item"
          >
            {item}
          </div>
        );
      });
    }
    const ddState = this.state.listOpen ? classes.Open : classes.Close;
    return (
      <div className={classes.Wrapper}>
        <div
          onClick={this.toggleList}
          className={classes.Header}
          data-testid="dropdown"
        >
          <span>{list[0]}</span> <i className="fas fa-caret-down" />
        </div>
        <div className={[classes.Dropdown, ddState].join(" ")}>
          {list.slice(1)}
        </div>
      </div>
    );
  }
}
export default onClickOutside(RoleDropdown);
