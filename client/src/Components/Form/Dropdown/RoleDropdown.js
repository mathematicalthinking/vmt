import React, { Component } from 'react';
import PropTypes from 'prop-types';
import onClickOutside from 'react-onclickoutside';
import classes from './dropdown.css';

class RoleDropdown extends Component {
  state = {
    listOpen: false,
  };

  handleClickOutside = () => {
    const { listOpen } = this.state;
    if (listOpen) {
      this.setState({
        listOpen: false,
      });
    }
  };

  toggleList = () => {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen,
    }));
  };

  render() {
    const { list, selectHandler } = this.props;
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
            key={item.name}
            onClick={() => {
              this.setState({ listOpen: false });
              selectHandler(item);
            }}
            onKeyPress={() => {
              this.setState({ listOpen: false });
              selectHandler(item);
            }}
            role="button"
            tabIndex="-2"
            className={className}
            data-testid="dropdown-item"
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
          tabIndex="-1"
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

RoleDropdown.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  selectHandler: PropTypes.func.isRequired,
};
export default onClickOutside(RoleDropdown);
