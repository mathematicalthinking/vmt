/* eslint-disable prettier/prettier */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { BigModal as Modal, Button } from 'Components';
import classes from './importModal.css';

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
    footer,
  } = props;

  const [allChecked, setAllChecked] = React.useState({});

  // Handle cell value changes (notify parent)
  const handleCellChange = (rowIndex, property, value) => {
    const changes = [{ rowIndex, [property]: value }];
    onChanged(changes);
  };

  // Handle "select all" checkbox for boolean columns
  const handleAllChecked = (columnIndex) => {
    const property = columnConfig[columnIndex].property;
    const newValue = !isAllChecked(columnIndex);

    // Create changes for all rows
    const changes = data.map((_, rowIndex) => ({
      rowIndex,
      [property]: newValue,
    }));

    setAllChecked((prev) => ({ ...prev, [columnIndex]: newValue }));
    onChanged(changes);
  };

  // Check if all items in a boolean column are checked
  const isAllChecked = (columnIndex) => {
    const property = columnConfig[columnIndex].property;

    if (data.length === 0) return false;

    // Check if stored state exists first
    if (typeof allChecked[columnIndex] === 'boolean') {
      return allChecked[columnIndex];
    }

    // Calculate from data - handle both boolean and string values
    const allCheckedInData = data.every(
      (row) => row[property] === true || row[property] === 'true'
    );
    return allCheckedInData;
  };

  // Check if a cell should be highlighted (error)
  const isHighlighted = (rowIndex, property) => {
    return highlights.some(
      (highlight) =>
        highlight.rowIndex === rowIndex &&
        highlight.property === property &&
        highlight.error
    );
  };

  // Check if a cell should have a warning
  const hasWarning = (rowIndex, property) => {
    return highlights.some(
      (highlight) =>
        highlight.rowIndex === rowIndex &&
        highlight.property === property &&
        highlight.warning
    );
  };

  // Determine the color class for a comment line
  const getCommentLineClass = (line) => {
    // Warning messages (expandable list)
    const warningMessages = [
      'A username has been generated',
      'username has been generated', // alternative phrasing
    ];

    if (warningMessages.some((msg) => line.includes(msg))) {
      return 'warning';
    }

    // All other messages starting with * are errors
    if (line.trim().startsWith('*') && line.trim().length > 1) {
      return 'error';
    }

    // Default (no special styling)
    return '';
  };

  // Render comment text with appropriate colors for each line
  const renderCommentText = (text) => {
    if (!text) return '';

    const lines = text.split('\n').filter((line) => line.trim() !== '');

    return lines.map((line, index) => (
      <span
        key={index}
        className={`${classes.commentLine} ${
          getCommentLineClass(line) ? classes[getCommentLineClass(line)] : ''
        }`}
      >
        {line}
        {index < lines.length - 1 && <br />}
      </span>
    ));
  };

  // Get action for a specific row
  const getRowAction = (rowIndex) => {
    const rowAction = rowConfig.find((config) => config.rowIndex === rowIndex);
    return rowAction && rowAction.action ? rowAction.action() : null;
  };

  // Check if we have any actions to display
  const hasActions = () => {
    return canDeleteRow || rowConfig.some((config) => config.action);
  };

  const handleSubmit = () => {
    if (highlights.length > 0) {
      // Re-validate the data by triggering onChanged with current data
      const changes = data.map((row, rowIndex) => ({ rowIndex, ...row }));
      onChanged(changes);
    } else {
      onSubmit(data);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleDeleteRow = (rowIndex) => {
    onDeleteRow(rowIndex);
  };

  return (
    <Modal show={show}>
      <div className={classes.importModalContainer}>
        <div className={classes.importTableWrapper}>
          <table className={classes.importTable}>
            <thead>
              <tr>
                {columnConfig.map((column, columnIndex) => (
                  <th
                    key={column.property}
                    className={classes.importTableHeader}
                  >
                    <div className={classes.headerContent}>
                      <span className={classes.headerText}>
                        {column.header}
                      </span>
                      {column.type === 'boolean' && (
                        <input
                          type="checkbox"
                          className={classes.selectAllCheckbox}
                          checked={isAllChecked(columnIndex)}
                          onChange={() => handleAllChecked(columnIndex)}
                          title={`Select/deselect all ${column.header}`}
                        />
                      )}
                    </div>
                  </th>
                ))}
                {hasActions() && (
                  <th className={classes.importTableHeader}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={row.id || row.email || `${row.username}-${rowIndex}`}
                  className={classes.importTableRow}
                >
                  {columnConfig.map((column) => {
                    const value = row[column.property];
                    const highlighted = isHighlighted(
                      rowIndex,
                      column.property
                    );
                    const warning = hasWarning(rowIndex, column.property);

                    return (
                      <td
                        key={column.property}
                        className={`${classes.importTableCell} ${
                          highlighted ? classes.highlighted : ''
                        } ${warning ? classes.warning : ''}`}
                        style={column.style}
                      >
                        {column.type === 'boolean' ? (
                          <input
                            type="checkbox"
                            checked={value === true || value === 'true'}
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                column.property,
                                e.target.checked
                              )
                            }
                            disabled={column.readOnly}
                          />
                        ) : column.readOnly ? (
                          <div
                            className={classes.readonlyText}
                            style={column.style}
                          >
                            {column.property === 'comment'
                              ? renderCommentText(value)
                              : value || ''}
                          </div>
                        ) : (
                          <input
                            type="text"
                            defaultValue={value || ''}
                            onBlur={(e) =>
                              handleCellChange(
                                rowIndex,
                                column.property,
                                e.target.value
                              )
                            }
                            className={classes.textInput}
                            style={column.style}
                          />
                        )}
                      </td>
                    );
                  })}
                  {hasActions() && (
                    <td
                      className={`${classes.importTableCell} ${classes.actionCell}`}
                    >
                      {canDeleteRow && (
                        <DeleteButton
                          onClick={() => handleDeleteRow(rowIndex)}
                        />
                      )}
                      {getRowAction(rowIndex)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={classes.importModalButtons}>
          <Button theme="Cancel" click={handleCancel}>
            Cancel
          </Button>
          <Button click={handleSubmit}>
            {highlights.length > 0 ? 'Validate' : 'Submit'}
          </Button>
        </div>

        {footer && <div className={classes.importModalFooter}>{footer}</div>}
      </div>
    </Modal>
  );
}

const DeleteButton = ({ onClick }) => {
  const [isConfirm, setIsConfirm] = React.useState(false);

  const handleConfirm = () => {
    onClick();
    setIsConfirm(false);
  };

  const handleCancel = () => {
    setIsConfirm(false);
  };

  return (
    <div className={classes.deleteButtonContainer}>
      {isConfirm ? (
        <Fragment>
          Delete?
          <div
            role="button"
            onKeyPress={handleCancel}
            onClick={handleCancel}
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
            onKeyPress={handleConfirm}
            onClick={handleConfirm}
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
        <Fragment>
          <span style={{ opacity: 0, visibility: 'hidden' }}>Delete?</span>
          <div
            role="button"
            onKeyPress={() => setIsConfirm(true)}
            onClick={() => setIsConfirm(true)}
            tabIndex="-2" // @TODO What's a more appropriate value?
            title="Delete row"
          >
            <i className="fa fa-times-circle" />
          </div>
          <span style={{ opacity: 0, visibility: 'hidden' }}>
            <i className="fa fa-check-circle" style={{ margin: '0 5px' }} />
          </span>
        </Fragment>
      )}
    </div>
  );
};

ImportModal.propTypes = {
  show: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  columnConfig: PropTypes.arrayOf(
    PropTypes.shape({
      property: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      type: PropTypes.string,
      style: PropTypes.object,
      readOnly: PropTypes.bool,
    })
  ).isRequired,
  rowConfig: PropTypes.arrayOf(
    PropTypes.shape({
      rowIndex: PropTypes.number.isRequired,
      action: PropTypes.func.isRequired,
    })
  ),
  onSubmit: PropTypes.func.isRequired,
  highlights: PropTypes.arrayOf(
    PropTypes.shape({
      rowIndex: PropTypes.number.isRequired,
      property: PropTypes.string.isRequired,
      error: PropTypes.bool,
      warning: PropTypes.bool,
    })
  ),
  onChanged: PropTypes.func,
  onCancel: PropTypes.func,
  canDeleteRow: PropTypes.bool,
  onDeleteRow: PropTypes.func,
  footer: PropTypes.element,
};

ImportModal.defaultProps = {
  highlights: [],
  rowConfig: [],
  onChanged: () => {},
  onCancel: () => {},
  canDeleteRow: true,
  onDeleteRow: () => {},
  footer: null,
};

DeleteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
