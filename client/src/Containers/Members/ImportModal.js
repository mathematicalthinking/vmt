/* eslint-disable prettier/prettier */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDataSheet from 'react-datasheet';
import { Modal, Button } from 'Components';
// import 'react-datasheet/lib/react-datasheet.css';

export default function ImportModal(props) {
  const { show, data, columnNames, headers, onSubmit } = props;
  const [tableData, setTableData] = React.useState([]);

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
    <Modal width={900} show={show} closeModal={() => {}}>
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
          sheetRenderer={(givenProps) => (
            <table style={{ marginBottom: '10px', marginTop: '20px' }}>
              <thead>
                <tr>
                  {headers.map((col) => (
                    <th key={col} style={{ textAlign: 'center' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{givenProps.children}</tbody>
            </table>
          )}
          valueRenderer={(cell) => {
            return cell.value.toString();
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
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  columnNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

ImportModal.defaultProps = {};
