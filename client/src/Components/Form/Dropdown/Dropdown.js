// @TODO THINK ABOUT COMBINING THIS CODE WITH ROLEDROPDOWN ... WE'RE REPEATING
// A BUNCH OF CODE BUT SOMETIMES I FEEL LIKE THATS BETTER THAN ALL THESE COMPLEX
// CONDITIONALS DETERMINNING WHAT KIND OF ITEMS THE DROP DOWN SHOULD
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import onClickOutside from 'react-onclickoutside';
import classes from './dropdown.css';

class Dropdown extends Component {
  constructor(props) {
    super(props);
    const { open } = this.props;
    this.state = {
      listOpen: open,
      selected: [],
    };
  }

  handleClickOutside = () => {
    this.setState({
      listOpen: false,
    });
  };

  toggleList = () => {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen,
    }));
  };

  select = (name, id, prevSelected) => {
    const { selectHandler } = this.props;
    const { selected } = this.state;
    let updatedSelected = [...selected];
    // if already selected remove from list
    if (prevSelected) {
      updatedSelected = updatedSelected.filter(room => room.id !== id);
    } else {
      updatedSelected.push({ name, id });
    }
    this.setState({
      selected: updatedSelected,
    });
    // run function passed in props to update parents state
    selectHandler(updatedSelected);
  };

  render() {
    const { list } = this.props;
    const { listOpen } = this.state;
    let ElementList;
    if (list.length === 0 || !list) {
      ElementList = (
        <div className={classes.ErrorItem}>There&#39;s nothing in here yet</div>
      );
    } else {
      ElementList = list.map((item, i) => {
        // check if this item is in state.selected
        const colorClass = classes.ListItem;
        const backgroundClass =
          i % 2 === 0 ? classes.Background1 : classes.Background2;
        const className = [colorClass, backgroundClass].join(' ');
        return (
          <div
            key={item}
            onClick={() => this.select(item)}
            onKeyPress={() => this.select(item)}
            tabIndex="-2"
            role="button"
            className={className}
          >
            {item}
          </div>
        );
      });
    }
    const ddState = listOpen ? classes.Open : classes.Close;
    return (
      <div className={classes.Wrapper}>
        <div
          onClick={this.toggleList}
          onKeyPress={this.toggleList}
          role="button"
          tabIndex="-3"
          className={classes.Header}
          data-testid="dropdown"
        >
          <span>{ElementList[0]}</span> <i className="fas fa-caret-down" />
        </div>
        <div className={[classes.Dropdown, ddState].join(' ')}>
          {ElementList.slice(1)}
        </div>
      </div>
    );
  }
}

Dropdown.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  selectHandler: PropTypes.func.isRequired,
  open: PropTypes.func.isRequired,
};
export default onClickOutside(Dropdown);
