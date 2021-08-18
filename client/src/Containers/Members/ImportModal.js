/* eslint-disable prettier/prettier */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDataSheet from 'react-datasheet';
import { Modal, Button } from 'Components';
// import 'react-datasheet/lib/react-datasheet.css';

export default function ImportModal(props) {
  const { show, data, columnNames, headers, onSubmit, closeModal } = props;
  const [tableData, setTableData] = React.useState([]);
  const [allChecked, setAllChecked] = React.useState({});

  React.useEffect(() => {
    setTableData(
      data.map((row) => columnNames.map((col) => ({ value: row[col] })))
    );
  }, [data]);

  const _handleOk = () => {
    const returnedData = tableData.map((row) =>
      row.reduce((acc, col, index) => {
        return { ...acc, [columnNames[index]]: col.value };
      }, {})
    );

    onSubmit(returnedData);
  };

  const _handleCellsChanged = (changes) => {
    const grid = tableData.map((row) => [...row]);
    changes.forEach(({ row, col, value }) => {
      grid[row][col] = { ...grid[row][col], value };
    });
    setTableData(grid);
  };

  const _handleAllChecked = (col) => {
    const value = !_isAllChecked(col);
    const changes = tableData.map((row, index) => ({ row: index, col, value }));
    for (let row = 0; row++; row < tableData.length) {
      changes.push({ row, col, value });
    }
    setAllChecked((prevState) => ({ ...prevState, [col]: !prevState[col] }));
    _handleCellsChanged(changes);
  };

  const _isAllChecked = (col) => {
    if (typeof allChecked[col] !== 'boolean')
      setAllChecked((prevState) => ({ ...prevState, [col]: false }));
    return !!allChecked[col]; // use !! in case the above setAllChecked hasn't completed
  };

  const _isBoolean = (col) => {
    return (
      tableData[0] &&
      tableData[0][col] &&
      typeof tableData[0][col].value === 'boolean'
    );
  };

  const _sheetRenderer = (givenProps) => (
    <table style={{ marginBottom: '10px', marginTop: '20px' }}>
      <thead>
        <tr>
          {headers.map((col, index) => (
            <th key={col} style={{ textAlign: 'center' }}>
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
        </tr>
      </thead>
      <tbody>{givenProps.children}</tbody>
    </table>
  );

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
      <td {...rest}>
        {typeof cell.value === 'boolean' ? (
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
    <Modal width={900} show={show} closeModal={closeModal}>
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
          cellRenderer={_cellRenderer}
          onCellsChanged={_handleCellsChanged}
        />
        <Button click={_handleOk}>Submit</Button>
      </div>
    </Modal>
  );
}

ImportModal.propTypes = {
  show: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  columnNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

ImportModal.defaultProps = {};
