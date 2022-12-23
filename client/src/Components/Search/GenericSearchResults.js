import React from 'react';
import PropTypes from 'prop-types';
import { uniqueId } from 'lodash';
import Button from 'Components/UI/Button/Button';
import classes from './genericSearchResults.css';

function GenericSearchResults({ itemsSearched, select }) {
  return (
    <ul className={classes.SearchResults}>
      {itemsSearched.map((item) => (
        <React.Fragment key={uniqueId(item)}>
          <li key={uniqueId(item)} className={classes.SearchResItem}>
            {item}
            <Button click={() => select(item)}>Add</Button>
          </li>
        </React.Fragment>
      ))}
    </ul>
  );
}

GenericSearchResults.propTypes = {
  itemsSearched: PropTypes.arrayOf(PropTypes.string).isRequired,
  select: PropTypes.func.isRequired,
};

export default GenericSearchResults;
