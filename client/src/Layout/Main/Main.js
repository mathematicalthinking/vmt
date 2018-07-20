import React from 'react';
import classes from './main.css';
const main = props => {
  let details;
  return (
    <section className={classes.Container}>
      <section className={classes.SidePanel}>
        <div className={classes.Image}>Image</div>
        {details}
      </section>
      <section className={classes.Main}>
        <div className={classes.Tabs}>
          {props.tabs}
        </div>
        <div className={classes.MainContent}>
          {props.content}
        </div>
      </section>
    </section>
  )
}

export default main;
