import React, { Component } from 'react';
import classes from './dropdown.css'
import onClickOutside from 'react-onclickoutside'
class Dropdown extends Component{
  state = {
    listOpen: false,
    selected: [],
  }

  handleClickOutside = event => {
    this.setState({
      listOpen: false
    })
  }

  toggleList = event => {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen,
    }))
  }

  select = (name, id, selected) => {
    let updatedSelected = [...this.state.selected]
    // if already selected remove from list
    if (selected) {
      updatedSelected = updatedSelected.filter(room => room.id !== id)
    }
    else {updatedSelected.push({name, id,})}
    this.setState({
      selected: updatedSelected,
    })
    // run function passed in props to update parents state
    this.props.selectHandler(updatedSelected)
  }

  render() {
    console.log(this.props.list)

    const list = this.props.list.map((item, i)=> {
      // check if this item is in state.selected
      let colorClass = classes.ListItem;
      let selected = false;
      if (this.state.selected.find(room => room.id === item.id)){
        colorClass = classes.ListItemSelected;
        selected = true
      }
      const backgroundClass = (i%2 === 0) ? classes.Background1 : classes.Background2;
      const className = [colorClass, backgroundClass].join(" ")
      return (
      <div
        key={i}
        onClick={event => this.select(item.name, item.id, selected)}
        className={className}
        id={item.id}
      >{item.name}</div>
    )
    })

    const ddState = this.state.listOpen ? classes.Open : classes.Close;
    return (
      <div className={classes.Wrapper}>
        <div onClick={this.toggleList} className={classes.Header}><span>{this.props.title}</span> <i class="fas fa-caret-down"></i></div>
        <div className={[classes.Dropdown, ddState].join(" ")}>{list}</div>
      </div>
    )
  }
}
export default  onClickOutside(Dropdown);
