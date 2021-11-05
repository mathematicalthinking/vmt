import React from 'react';
import PropTypes from 'prop-types';
import classes from './iframe.css';

const Iframe = ({ source, title }) => {
  return (
    <iframe
      src={source}
      title={title}
      className={classes.iFrame}
      // height={typeof h === 'number' ? `${h}px` : h}
      // width={typeof w === 'number' ? `${w}px` : w}
      type="text/html"
      allowscriptaccess="always"
      allowFullScreen="true"
      // scrolling="yes"
      // allownetworking="all"
    />
  );
};

Iframe.propTypes = {
  source: PropTypes.node.isRequired,
  title: PropTypes.string,
  // h: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  // w: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Iframe.defaultProps = {
  title: 'VMT iFrame',
  // h: '100%',
  // w: '100%',
};

export default Iframe;
