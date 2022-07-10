/* eslint-disable prettier/prettier */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ReactDataSheet from 'react-datasheet';
import { BigModal as Modal, Button } from 'Components';
// import 'react-datasheet/lib/react-datasheet.css';
// import './importModal.css';

/* 

data is an array of objects, where each object represents a row in the table.
  Each row is of the form:
  
  {<property1>, <property2>, <property3>}
  
  where each of the properties corresponds to properties mentioned in the
  columnConfig prop. The values of each property are the data to display,
  either a string or a boolean. 


columnConfig is an array of objects, where each object represents a column
  in the table.  Each column is of the form:
  {
    property - the name of the property used in the 'data' prop for each row
    header - the string to display on the top of each column
    type - can be 'string' or 'boolean'. If boolean, provides a checkbox in each
            row and a "select/deselect all" checkbox on the top of the column
    style - a style to apply to cells in that column (not the header, however)
    readOnly - if true, cells in that column cannot be edited
  }
  
highlights is an array of objects, where each object represents a specific cell
  that should be highlighted (highlit?). Each specification is of the form:
  {
    rowIndex - index of the row in the data prop that contains a cell to highlight
    property - the name of the property in that row to highlight
  }
  
  rowConfig is an array of objects, where each object represents an action to take on
    a specific row. Each object is of the form:
    {
      rowIndex - index of the row in the data prop for which an action should be displayed
      action - a function that returns a React component that gets displayed in the Action column for that row
    }
  
*/

export default function ImportModal(props) {
  const {
    show,
    data,
    columnConfig,
    rowConfig,
    highlights,
    onSubmit,
    onChanged,
    onCancel,
    canDeleteRow,
    onDeleteRow,
  } = props;
  const [tableData, setTableData] = React.useState([]);
  const [allChecked, setAllChecked] = React.useState({});

  // converts data into the format used by ReactDataSheet. Note that we do not
  // reveal to our clients that format because maybe we will switch away from
  // ReactDataSheet in the future. Instead, the data prop uses a generic format
  // for the data (array of objects with properties representing each row) and
  // we have a columnConfig prop that provides the additional information that
  // is needed for displaying the table. This separation of concerns -- not
  // revealing the implementation of a component to its clients -- IS VERY
  // IMPORTANT for comprehensibity and reusability of code, and simplifies future
  // enhancements/refactoring (i.e., we can change the way that ImportModal does
  // its job without having to change the code in any of its clients).
  React.useEffect(() => {
    setTableData(
      data.map((row) =>
        columnConfig.map((col) => {
          const { property, ...rest } = col;
          return { value: row[property], ...rest };
        })
      )
    );
  }, [data]);

  // converts data back from the ReactDataSheet format to the format of the
  // data prop
  const _convertTableToData = (grid) => {
    return grid.map((row) =>
      row.reduce((acc, col, index) => {
        return { ...acc, [columnConfig[index].property]: col.value };
      }, {})
    );
  };

  const _handleOk = () => {
    const returnedData = _convertTableToData(tableData);
    onSubmit(returnedData);
  };

  const _handleCancel = () => {
    onCancel();
  };

  const _handleCellsChanged = (changes) => {
    const grid = tableData.map((row) => [...row]);
    const reportedChanges = [];
    changes.forEach(({ row, col, value }) => {
      grid[row][col] = { ...grid[row][col], value };
      reportedChanges.push({
        rowIndex: row,
        [columnConfig[col].property]: value,
      });
    });
    // setTableData(grid);
    onChanged(reportedChanges);
  };

  const _handleDelete = (row) => {
    const newData = [...tableData];
    newData.splice(row, 1);
    // setTableData(newData);
    onDeleteRow(row);
  };

  // when the user clicks on a 'select/deselect all' checkbox in column col,
  // first get the new value, then create a changes object in the form needed
  // by '_handleCellsChanged' whereby we specify every row for the given column
  // show be of the new value.  We also changed the state of allChecked.
  const _handleAllChecked = (col) => {
    const value = !_isAllChecked(col);
    const changes = tableData.map((row, index) => ({ row: index, col, value }));
    for (let row = 0; row++; row < tableData.length) {
      changes.push({ row, col, value });
    }
    setAllChecked((prevState) => ({ ...prevState, [col]: !prevState[col] }));
    _handleCellsChanged(changes);
  };

  // checks whether the 'select/deselect all' checkbox on top of column col is
  // checked. Because we don't initialize these values (we could based on
  // columnConfig, but why bother?), we initialize it here if needed.
  // NOTE: _isAllChecked and _handleAllChecked is another example of
  // separation of concerns. These functions are the only ones that know how
  // state is represented inside of allChecked. If we have to change this
  // representation in the future, we need only change these two functions. This
  // approach is also known as following the policy of accessing state via
  // getter and setter functions rather than accessing the state directly.
  // Admittedly, it is typically easier in React to get/set the state directly
  // via the return values from useState, but sometimes this pattern is helpful
  // (i.e., the state representation is somewhat complex and might be refactored).
  const _isAllChecked = (col) => {
    if (typeof allChecked[col] !== 'boolean')
      setAllChecked((prevState) => ({ ...prevState, [col]: false }));
    return !!allChecked[col]; // use !! in case the above setAllChecked hasn't completed
  };

  const _isBoolean = (col) => {
    return columnConfig[col].type === 'boolean';
  };

  const _getHeaders = () => {
    return columnConfig.map((row) => row.header);
  };

  const _isHighlighted = (row, col) => {
    return highlights.find(
      (elt) =>
        elt.rowIndex === row && elt.property === columnConfig[col].property
    );
  };

  // Do we have at least one action? Used to decide whether to have an Action column
  const _hasActions = () => {
    return rowConfig.some((row) => row.action);
  };

  // Used to place an action (usually a button or set of buttons) in the Action column at the end of indicated row.
  const _rowAction = (row) => {
    const rowAction = rowConfig.find((elt) => elt.rowIndex === row);
    return rowAction ? rowAction.action && rowAction.action() : false;
  };

  const _sheetRenderer = (givenProps) => {
    const { children } = givenProps;
    return (
      <table style={{ marginBottom: '10px', marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            {_getHeaders().map((col, index) => (
              <th key={col} style={{ padding: '10px', textAlign: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {col}
                  {_isBoolean(index) && (
                    <input
                      style={{ margin: '5px auto' }}
                      type="checkbox"
                      checked={_isAllChecked(index)}
                      onChange={() => _handleAllChecked(index)}
                    />
                  )}
                </div>
              </th>
            ))}
            {(canDeleteRow || _hasActions()) && (
              <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    );
  };

  const _rowRenderer = (ps) => {
    const { children, row } = ps;
    return (
      <tr>
        {children}
        <td className="action-cell">
          {canDeleteRow && <DeleteButton onClick={() => _handleDelete(row)} />}
          {_rowAction(row) || null}
        </td>
      </tr>
    );
  };

  const _cellRenderer = (ps) => {
    const { cell, row, col, children } = ps;
    return (
      <td
        {...ps}
        style={
          _isHighlighted(row, col)
            ? { ...cell.style, border: '2px solid red' }
            : { ...cell.style }
        }
      >
        {_isBoolean(col) ? (
          <input
            type="checkbox"
            checked={cell.value}
            onChange={() =>
              _handleCellsChanged([{ row, col, value: !cell.value }])
            }
          />
        ) : (
          children
        )}
      </td>
    );
  };

  return (
    <Modal show={show}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}
      >
        <ReactDataSheet
          data={tableData}
          sheetRenderer={_sheetRenderer}
          valueRenderer={(cell) => {
            return cell.value;
          }}
          rowRenderer={_rowRenderer}
          cellRenderer={_cellRenderer}
          onCellsChanged={_handleCellsChanged}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '40%',
            marginTop: '10px',
          }}
        >
          <Button click={_handleOk}>
            {highlights.length > 0 ? 'Validate' : 'Submit'}
          </Button>
          <Button theme="Cancel" click={_handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const DeleteButton = (props) => {
  const { onClick } = props;
  const [isConfirm, setIsConfirm] = React.useState(false);

  const _handleConfirm = () => {
    onClick();
    setIsConfirm(false);
  };

  const _handleCancel = () => {
    setIsConfirm(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {isConfirm ? (
        <Fragment>
          Delete?
          <div
            role="button"
            onKeyPress={_handleCancel}
            onClick={_handleCancel}
            tabIndex="-2" // @TODO What's a more appropriate value?
            title="Cancel delete"
          >
            <i
              className="fa fa-times-circle"
              style={{ color: 'red', margin: '0 5px' }}
            />
          </div>
          <div
            role="button"
            onKeyPress={_handleConfirm}
            onClick={_handleConfirm}
            tabIndex="-2" // @TODO What's a more appropriate value?
            title="Confirm delete"
          >
            <i
              className="fa fa-check-circle"
              style={{ color: 'green', margin: '0 5px' }}
            />
          </div>
        </Fragment>
      ) : (
        <div
          role="button"
          onKeyPress={() => setIsConfirm(true)}
          onClick={() => setIsConfirm(true)}
          tabIndex="-2" // @TODO What's a more appropriate value?
          title="Delete row"
        >
          <i className="fa fa-times-circle" />
        </div>
      )}
    </div>
  );
};

ImportModal.propTypes = {
  show: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  columnConfig: PropTypes.arrayOf(
    PropTypes.shape({ property: PropTypes.string, type: PropTypes.string })
  ).isRequired,
  rowConfig: PropTypes.arrayOf(
    PropTypes.shape({
      rowIndex: PropTypes.number.isRequired,
      action: PropTypes.func.isRequired,
    })
  ),
  onSubmit: PropTypes.func.isRequired,
  highlights: PropTypes.arrayOf(PropTypes.shape({})),
  onChanged: PropTypes.func,
  onCancel: PropTypes.func,
  canDeleteRow: PropTypes.bool,
  onDeleteRow: PropTypes.func,
};

ImportModal.defaultProps = {
  highlights: [],
  rowConfig: [],
  onChanged: () => {},
  onCancel: () => {},
  canDeleteRow: true,
  onDeleteRow: () => {},
};

DeleteButton.propTypes = {
  onClick: PropTypes.func,
};

DeleteButton.defaultProps = {
  onClick: () => {},
};
