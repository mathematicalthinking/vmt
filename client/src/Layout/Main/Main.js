// PROPS:
  // tabs:  list of strings
  // content: jsx || string (if no content)
  // activeTab: string
//
import React from 'react';
import classes from './main.css';
import TabList from '../../Components/Navigation/TabList/TabList';

const main = props => {
  console.log(props.contentCreate)
  return (
    <section className={classes.Container}>
      <section className={classes.SidePanel}>
        <div className={classes.Title}>{props.title}</div>
        <div className={classes.Image}>Image</div>
        <div className={classes.SpTitle}>{props.sidePanelTitle}</div>
      </section>
      <section className={classes.Main}>
        <TabList tabs={props.tabs} activeTab={props.activeTab} activateTab={props.activateTab}/>
        <div className={classes.MainContent}>
          {/* THIS IS BAD -- THIS LAYOUT SHOULDNT NEED TO KNOW WHAT THE ACTIVE TAB IS  */}
          {/* I THINK IT COULD BE EASILYU FIXED JUST PASS THE CREATE PIECE IF WE WANT IT THERE AND DONT IF WE DONT */}
          {(props.activeTab !== 'Settings') ? <div className={classes.CreateContainer}>
            {props.contentCreate}
          </div> : null}
          {props.content}
        </div>
      </section>
    </section>
  )
}


export default main;
