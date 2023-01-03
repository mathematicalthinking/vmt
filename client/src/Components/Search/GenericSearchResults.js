import React from 'react';
import PropTypes from 'prop-types';
import { uniqueId } from 'lodash';
import Button from 'Components/UI/Button/Button';
import classes from './genericSearchResults.css';

function GenericSearchResults({ itemsSearched }) {
  return (
    <ul className={classes.SearchResults}>
      {itemsSearched.map((item) => (
        <li
          key={item.key || uniqueId(item.label)}
          className={classes.SearchResItem}
        >
          {item.label}
          <Button click={() => item.onClick && item.onClick(item.key)}>
            {item.buttonLabel}
          </Button>
        </li>
      ))}
    </ul>
  );
}

GenericSearchResults.propTypes = {
  itemsSearched: PropTypes.arrayOf(
    PropTypes.shape({
      buttonLabel: PropTypes.string,
      onClick: PropTypes.func,
      label: PropTypes.string,
      key: PropTypes.string,
    })
  ).isRequired,
};

export default GenericSearchResults;
