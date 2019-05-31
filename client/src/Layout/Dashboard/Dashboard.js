import React from 'react';
import PropTypes from 'prop-types';
import classes from './dashboard.css';

const Dashboard = ({ sidePanel, mainContent, breadCrumbs, tabs }) => (
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
);

Dashboard.propTypes = {
  sidePanel: PropTypes.element.isRequired,
  mainContent: PropTypes.element.isRequired,
  breadCrumbs: PropTypes.element.isRequired,
  tabs: PropTypes.element.isRequired,
};
export default Dashboard;
