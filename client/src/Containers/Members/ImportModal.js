/* eslint-disable prettier/prettier */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ReactDataSheet from 'react-datasheet';
import { BigModal as Modal, Button } from 'Components';
import 'react-datasheet/lib/react-datasheet.css';
import './importModal.css';

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
  }
  
highlights is an array of objects, where each object represents a specific cell
  that should be highlighted (highlit?). Each specification is of the form:
  {
    rowIndex - index of the row in the data prop that contains a cell to highlight
    property - the name of the property in that row to highlight
  }
  
  
*/

export default function ImportModal(props) {
  const {
    show,
    data,
    columnConfig,
    highlights,
    onSubmit,
    onChanged,
    onCancel,
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
    changes.forEach(({ row, col, value }) => {
      grid[row][col] = { ...grid[row][col], value };
    });
    setTableData(grid);
    onChanged(_convertTableToData(grid));
  };

  const _handleDelete = (row) => {
    const newData = [...tableData];
    newData.splice(row, 1);
    setTableData(newData);
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

  // eslint-disable-next-line no-unused-vars
  const _isHighlighted = (row, col) => {
    return highlights.find(
      (elt) =>
        elt.rowIndex === row && elt.property === columnConfig[col].property
    );
  };

  const _sheetRenderer = (givenProps) => (
    <table style={{ marginBottom: '10px', marginTop: '20px' }}>
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
          <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
        </tr>
      </thead>
      <tbody>{givenProps.children}</tbody>
    </table>
  );

  const _rowRenderer = (ps) => {
    return (
      <tr>
        {ps.children}
        <td className="action-cell">
          <DeleteButton onClick={() => _handleDelete(ps.row)} />
        </td>
      </tr>
    );
  };

  const _cellRenderer = (ps) => {
    const {
      cell,
      row,
      col,
      as,
      columns,
      attributesRenderer,
      selected,
      editing,
      updated,
      ...rest
    } = ps;
    return (
      <td
        {...rest}
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
          ps.children
        )}
      </td>
    );
  };

  return (
    <Modal show={show} closeModal={() => {}}>
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
          <Button click={_handleOk}>Submit</Button>
          <Button click={_handleCancel}>Cancel</Button>
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
  columnConfig: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onSubmit: PropTypes.func.isRequired,
  highlights: PropTypes.arrayOf(PropTypes.shape({})),
  onChanged: PropTypes.func,
  onCancel: PropTypes.func,
};

ImportModal.defaultProps = {
  highlights: [],
  onChanged: () => {},
  onCancel: () => {},
};

DeleteButton.propTypes = {
  onClick: PropTypes.func,
};

DeleteButton.defaultProps = {
  onClick: () => {},
};
