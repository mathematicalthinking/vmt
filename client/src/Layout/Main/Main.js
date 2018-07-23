// PROPS:
  // tabs:  list of strings
  // content: jsx || string (if no content)
  // activeTab: string
//
import React, { Component } from 'react';
import classes from './main.css';
import Aux from '../../Components/HOC/Auxil';
import Button from '../../Components/UI/Button/Button';
import Modal from '../../Components/UI/Modal/Modal';

class Main extends Component {
  state = {
    modalOpen: false,
  }

  render() {
    const tabElems = this.props.tabs.map(tab => {
      let style = classes.Tab;
      if (tab === this.props.activeTab) {
        style = [classes.Tab, classes.ActiveTab].join(' ')
      }
      return (
        <div key={tab} id={tab} onClick={this.props.activateTab} className={style}>{tab}</div>
      )
    })
    console.log(this.props.contentCreate)
    return (
      <Aux>
        <h1 className={classes.Title}>{this.props.title}</h1>
        <section className={classes.Container}>
          <section className={classes.SidePanel}>
            <div className={classes.Image}>Image</div>
          </section>
          <section className={classes.Main}>
            <div className={classes.Tabs}>
              {tabElems}
            </div>
            <div className={classes.MainContent}>
              {(this.props.activeTab !== 'Settings') ? <div className={classes.CreateContainer}>
                {this.props.contentCreate}
              </div> : null}
              {this.props.content}
            </div>
          </section>
        </section>
      </Aux>
    )
  }
}

export default Main;
