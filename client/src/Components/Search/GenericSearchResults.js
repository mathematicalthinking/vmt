import React from 'react';
import PropTypes from 'prop-types';

function GenericSearchResults({ itemsSearched, actions, searchText }) {
  return (
    <ul>
      {itemsSearched.map((item) => (
        <li>{item}</li>
      ))}
    </ul>
  );
}

GenericSearchResults.propTypes = {
  itemsSearched: PropTypes.arrayOf().isRequired,
  actions: PropTypes.arrayOf(PropTypes.func).isRequired,
  searchText: PropTypes.string.isRequired,
};

export default GenericSearchResults;
