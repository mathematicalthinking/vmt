import React from 'react';
import classes from './dashboard.css';

const Dashboard = React.memo(
  ({ sidePanel, mainContent, breadCrumbs, tabs }) => (
    <section className={classes.Container}>
      <div className={classes.BreadCrumbs}>{breadCrumbs}</div>
      <div className={classes.Main}>
        <div className={classes.SidePanel}>{sidePanel}</div>
        <div className={classes.Content}>
          <div className={classes.Tabs}>{tabs}</div>
          <div className={classes.MainContent}>{mainContent}</div>
        </div>
      </div>
    </section>
  )
);

export default Dashboard;
