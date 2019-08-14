import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classes from './breadCrumbs.css';
// import glb from "../../../global.css";
const BreadCrumbs = ({ crumbs, notifications }) => {
  let ntf;
  if (crumbs.length > 1 && notifications.length > 0) {
    const { link } = crumbs[crumbs.length - 1];
    ntf = notifications.filter((n) => {
      if (n.parentResource) {
        return !link.includes(n.parentResource);
      }
      return !link.includes(n.resourceId);
    }).length;
  }

  const crumbElements = crumbs.map((crumb, i) => {
    let style = classes.Crumb;
    let seperatorStyle = classes.Seperator;
    if (i === crumbs.length - 1) {
      style = [classes.Crumb, classes.Active].join(' ');
      seperatorStyle = [classes.Seperator, classes.Hidden].join(' ');
    }
    return (
      <Link
        key={crumb.title}
        className={classes.CrumbContainer}
        to={crumb.link}
        style={{ zIndex: i }}
      >
        <div className={style} data-testid="crumb">
          {crumb.title}
          {crumb.title === 'My VMT' && ntf > 0 ? (
            <div className={classes.Ntf}>{ntf}</div>
          ) : null}
        </div>
        <div className={seperatorStyle}>
          {' '}
          <i className="fas fa-caret-right" />{' '}
        </div>
      </Link>
    );
  });
  return <div className={classes.BreadcrumbContainer}>{crumbElements}</div>;
};

BreadCrumbs.propTypes = {
  crumbs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})),
};

BreadCrumbs.defaultProps = {
  notifications: null,
};

export default BreadCrumbs;
