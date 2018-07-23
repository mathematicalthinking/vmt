// PROPS:
  // tabs:  list of strings
  // content: jsx || string (if no content)
  // activeTab: string
//
import React, { Component } from 'react';
import classes from './main.css';
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
    return (
      <section className={classes.Container}>
        <Modal
          show={this.state.modalOpen}
          closeModal={() => this.setState({modalOpen: false})}
          content={this.props.contentCreate}
        />
        <section className={classes.SidePanel}>
          <div className={classes.Image}>Image</div>
        </section>
        <section className={classes.Main}>
          <div className={classes.Tabs}>
            {tabElems}
          </div>
          <div className={classes.MainContent}>
            {(this.props.activeTab !== 'Settings') ? <div className={classes.CreateContainer}>
              <Button click={() => {this.setState({modalOpen: true})}}>Create</Button>
            </div> : null}
            {this.props.content}
          </div>
        </section>
      </section>
    )
  }
}

export default Main;
