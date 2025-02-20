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
          style={{ backgroundColor: `${item.backgroundColor}` }}
        >
          <div className={classes.Label}>{item.label}</div>{' '}
          {item.altLabel && (
            <div className={classes.AltLabel}>{item.altLabel}</div>
          )}
          <Button
            click={() => item.onClick && item.onClick(item.key)}
            disabled={item.disabled || false}
          >
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
      altLabel: PropTypes.string,
      key: PropTypes.string,
      backgroundColor: PropTypes.string,
      disabled: PropTypes.bool,
    })
  ).isRequired,
};

export default GenericSearchResults;
