/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SelectionTable from './SelectionTable';
import classes from './resourceTables.css';

class ResourceTables extends Component {
  state = {
    participantList: [],
    facilitatorList: [],
  };

  componentDidMount() {
    const { data: userResources } = this.props;
    const { facilitatorList, participantList } = this.sortUserResources(
      userResources
    );
    this.setState({
      facilitatorList,
      participantList,
    });
  }

  componentDidUpdate(prevProps) {
    const { data: userResources } = this.props;
    if (prevProps.data !== userResources) {
      const { facilitatorList, participantList } = this.sortUserResources(
        userResources
      );
      this.setState({
        facilitatorList,
        participantList,
      });
    }
  }

  sortUserResources = (resources) => {
    const facilitatorList = [];
    const participantList = [];
    if (resources) {
      resources.forEach((userResource) => {
        if (userResource) {
          if (userResource.myRole === 'facilitator') {
            facilitatorList.push(userResource);
          } else {
            participantList.push(userResource);
          }
        }
      });
    }
    return {
      facilitatorList,
      participantList,
    };
  };

  render() {
    const { resource } = this.props;
    const { facilitatorList, participantList } = this.state;
    let displayResource = resource[0].toUpperCase() + resource.slice(1);
    if (displayResource === 'Activities') displayResource = 'Templates';

    return (
      <div className={classes.Row}>
        {facilitatorList.length > 0 && (
          <div className={classes.Col}>
            <h2 className={classes.ResourceHeader}>
              {displayResource} I Manage
            </h2>
            <SelectionTable {...this.props} data={facilitatorList} />
          </div>
        )}
        {participantList.length > 0 && (
          <div className={classes.Col}>
            <h2 className={classes.ResourceHeader}>
              {displayResource} I&#39;m a member of
            </h2>
            <SelectionTable {...this.props} data={participantList} />
          </div>
        )}
      </div>
    );
  }
}

ResourceTables.propTypes = {
  resource: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  //   notifications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

ResourceTables.defaultProps = {};

export default ResourceTables;
