import React, { Component } from 'react';
import classes from './dropDown.css'
import onClickOutside from 'react-onclickoutside'
class DropDown extends Component{
  state = {
    listOpen: false
  }

  handleClickOutside = event => {
    this.setState({
      listOpen: false
    })
  }

  toggleList = event => {
    console.log("clickInside")
    this.setState(prevState => ({
      listOpen: !prevState.listOpen
    }))
  }

  render() {
    const list = this.props.list.map(item => {
      return <div>{item}</div>
    })
    const ddState = this.state.listOpen ? classes.Open : classes.Close;
    return (
      <div onClick={this.toggleList} className={classes.Wrapper}>
        <div className={classes.Header}>{this.props.title}</div>
        <div className={[classes.DropDown, ddState].join(", ")}>{list}</div>
      </div>
    )
  }
}
export default  onClickOutside(DropDown);
