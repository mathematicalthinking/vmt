import React from 'react';
import PropTypes from 'prop-types';
import { uniqueId } from 'lodash';
import Button from 'Components/UI/Button/Button';

function GenericSearchResults({ itemsSearched, select, searchText }) {
  return (
    <ul>
      {itemsSearched.map((item) => (
        <React.Fragment key={uniqueId(item)}>
          <li key={uniqueId(item)}>{item}</li>
          <Button click={() => select(item)}></Button>
        </React.Fragment>
      ))}
    </ul>
  );
}

GenericSearchResults.propTypes = {
  itemsSearched: PropTypes.arrayOf(PropTypes.string).isRequired,
  select: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
};

export default GenericSearchResults;
