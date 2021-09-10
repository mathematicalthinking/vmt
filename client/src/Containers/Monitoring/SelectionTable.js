/* eslint-disable prettier/prettier */
/* eslint-disable consistent-return */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useSortableData } from '../../utils';
import classes from './selectionTable.css';

/**
 * Implements a table that allows for selecting / deselecting of each row and for sorting based on columns.  Right now, the implementation
 * is specfic to the type of room data I want to show (from MontoringView), but this should be a generic component.
 *
 * @TODO - SelectionTable is hard-wired for a specific structure of the data prop. That is, this knowledge is used
 * in initialization, toggleAll, and in rendering. Instead, we should provide SelectionTable with a config prop that specifies
 * which properties to pull out of data and how to display them (column headings). That would make SelectionTable more of a
 * generic component.
 *
 * Adapted from https://www.smashingmagazine.com/2020/03/sortable-tables-react/
 */

export default function SelectionTable(props) {
  const { data, selections, onChange } = props;
  const tableData = data.map((datum) => {
    const { _id, name, updatedAt, createdAt, currentMembers } = datum;
    return {
      _id,
      name,
      updatedAt,
      createdAt,
      currentMembers: currentMembers && currentMembers.length,
    };
  });

  const { items, requestSort, sortConfig } = useSortableData(tableData);
  const [toggleAll, setToggleAll] = React.useState(
    !Object.values(selections).includes(false)
  );
  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

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
          <th>
            <button
              type="button"
              onClick={() => requestSort('name')}
              className={classes[getClassNamesFor('name')]}
            >
              Room Name
            </button>
          </th>
          <th style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => requestSort('currentMembers')}
              className={classes[getClassNamesFor('currentMembers')]}
            >
              Currently In Room
            </button>
          </th>
          <th>
            <button
              type="button"
              onClick={() => requestSort('updatedAt')}
              className={classes[getClassNamesFor('updatedAt')]}
            >
              Last Updated
            </button>
          </th>
          <th>
            <button
              type="button"
              onClick={() => requestSort('createdAt')}
              className={classes[getClassNamesFor('createdAt')]}
            >
              Created
            </button>
          </th>
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
            <td>{item.name}</td>
            <td style={{ textAlign: 'center' }}>{item.currentMembers}</td>
            <td>{moment(item.updatedAt).format('LLL')}</td>
            <td>{moment(item.createdAt).format('LLL')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

SelectionTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onChange: PropTypes.func.isRequired,
  selections: PropTypes.PropTypes.shape({}).isRequired,
};
