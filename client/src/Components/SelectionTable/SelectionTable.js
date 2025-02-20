import React from 'react';
import PropTypes from 'prop-types';
import { useSortableData } from 'utils';
import classes from './selectionTable.css';

/**
 * Implements a table that allows for selecting / deselecting of each row and for sorting based on columns.
 *
 * Properties:
 * data - an array of objects, representing the rows of the table. Each object MUST have an _id property
 * config - Representation of the columns. An array of objects of the form {property, label, style, formatter}
 *    property - the property to pull out of each row's object
 *    label - how to label this column (i.e., the header)
 *    style - a style to apply to the header and data in this column
 *    formatter - a function to process the data for this column. e.g., how to display a date string.
 * selections - an object that represents which rows are selected: {row1_id: boolean, row2_id: boolean, etc.}
 * onChange - a function that gets called when the selections change. Gets called with just a selections objects representing the changes.
 *
 * Note that because the selections are given to SelectionTable, this is a controlled component.
 *
 *
 * Adapted from https://www.smashingmagazine.com/2020/03/sortable-tables-react/
 */

export default function SelectionTable(props) {
  const { data, selections, onChange, config: givenConfig } = props;
  const defaultConfig = {
    property: '',
    label: '',
    style: {},
    formatter: (val) => val || '',
  };
  const config = React.useMemo(
    () => givenConfig.map((col) => ({ ...defaultConfig, ...col })),
    [givenConfig]
  );

  const { items, requestSort, sortConfig } = useSortableData(data);
  const [toggleAll, setToggleAll] = React.useState(
    !Object.values(selections).includes(false)
  );
  const getClassNamesFor = (name) =>
    sortConfig && sortConfig.key === name ? sortConfig.direction : undefined;

  const _toggleAll = () => {
    const newValue = !toggleAll;
    const newSelections = {};
    Object.keys(selections).forEach((id) => {
      // only toggle those selections that are part of the given data. We need this because sometimes a selectionTable
      // could be given a set of selections that are a superset of its data. Alternatively, we could be more careful
      // in parents to ensure that selections and data are in sync (I'm talking to you, ResourceTables.)
      if (data.some((d) => d._id === id)) {
        newSelections[id] = newValue;
      }
    });
    setToggleAll(newValue);
    onChange(newSelections);
  };

  const _onChange = (newState) => {
    if (Object.values(newState).includes(false)) setToggleAll(false);
    onChange(newState);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>
            <input type="checkbox" checked={toggleAll} onChange={_toggleAll} />
          </th>
          {config.map((col) => (
            <th style={col.style} key={col.property}>
              <button
                type="button"
                style={{ cursor: 'pointer' }}
                onClick={() => requestSort(col.property)}
                className={classes[getClassNamesFor(col.property)]}
              >
                {col.label}
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item._id}>
            <td>
              <input
                type="checkbox"
                checked={selections[item._id]}
                onChange={() =>
                  _onChange({ [item._id]: !selections[item._id] })
                }
              />
            </td>
            {config.map((col) => (
              <td key={`${col.property}-${item._id}`} style={col.style}>
                {col.formatter(item[col.property])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

SelectionTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string }))
    .isRequired,
  config: PropTypes.arrayOf(
    PropTypes.shape({
      property: PropTypes.string,
      label: PropTypes.string,
      formatter: PropTypes.func,
      style: PropTypes.shape({}),
    }).isRequired
  ),
  onChange: PropTypes.func.isRequired,
  selections: PropTypes.PropTypes.shape({}).isRequired,
};
