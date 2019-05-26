// @TODO THINK ABOUT COMBINING THIS CODE WITH ROLEDROPDOWN ... WE'RE REPEATING
// A BUNCH OF CODE BUT SOMETIMES I FEEL LIKE THATS BETTER THAN ALL THESE COMPLEX
// CONDITIONALS DETERMINNING WHAT KIND OF ITEMS THE DROP DOWN SHOULD
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import onClickOutside from 'react-onclickoutside';
import classes from './dropdown.css';

class Dropdown extends Component {
  state = {
    listOpen: this.props.open,
    selected: [],
  };

  handleClickOutside = event => {
    this.setState({
      listOpen: false,
    });
  };

  toggleList = event => {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen,
    }));
  };

  select = (name, id, selected) => {
    let updatedSelected = [...this.state.selected];
    // if already selected remove from list
    if (selected) {
      updatedSelected = updatedSelected.filter(room => room.id !== id);
    } else {
      updatedSelected.push({ name, id });
    }
    this.setState({
      selected: updatedSelected,
    });
    // run function passed in props to update parents state
    this.props.selectHandler(updatedSelected);
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
        const className = [colorClass, backgroundClass].join(' ');
        return (
          <div
            key={i}
            onClick={event => this.select(item)}
            className={className}
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
        <div className={[classes.Dropdown, ddState].join(' ')}>
          {list.slice(1)}
        </div>
      </div>
    );
  }
}
export default onClickOutside(Dropdown);
