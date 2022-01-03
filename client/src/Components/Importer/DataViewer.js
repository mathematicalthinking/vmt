import React from 'react';
import PropTypes from 'prop-types';
import DataEditorModal from './DataEditorModal';
import useDataValidator from './DataValidator';

export default function DataViewer(props) {
  const { data, onClose, onCancel, show, columnConfig } = props;
  const [currentData, setCurrentData] = React.useState([]);

  React.useEffect(() => {
    setCurrentData(data);
  }, [data]);

  const {
    validatedData,
    validationErrors,
    rowConfig,
    sponsors,
  } = useDataValidator(currentData);

  const handleOnDeleteRow = (row) => {
    const newData = [...currentData];
    newData.splice(row, 1);
    setCurrentData(newData);
  };

  // 'changes' is an array of objects of the form {rowIndex, property: value}. For each unique row, we want to run
  // the validator on the data in that row.
  const handleOnChanged = (changes) => {
    // Make copies of the existing state -- data and errors. Clear out any errors among the rows we are revalidating (as
    // specified within 'changes'). Make whatever changes to the data needed as per the 'changes' parameter
    const newData = [...validatedData];
    changes.forEach(
      // eslint-disable-next-line no-return-assign
      ({ rowIndex, ...rest }) =>
        (newData[rowIndex] = { ...newData[rowIndex], ...rest })
    );

    // revalidate the rows that had changes. Place each validated row into the correct place in the newData and merge
    // any new errors
    setCurrentData(newData);
  };

  // Called when the user clicks on 'Submit' in the modal. Revalidate all the data. If there are any issues, update the data
  // and highligt any relevant cells. If no issues, update the data, create any new users, and invite them to the course.
  const handleOnSubmit = (newData) => {
    if (validationErrors.length > 0) {
      setCurrentData(newData);
    } else {
      onClose({ data: newData, sponsors });
    }
  };

  return (
    <DataEditorModal
      show={show}
      data={validatedData.length > 0 ? validatedData : data} // a little nicety. Display something even if we haven't finished validating
      columnConfig={columnConfig}
      highlights={validationErrors}
      rowConfig={rowConfig}
      onChanged={handleOnChanged}
      onSubmit={handleOnSubmit}
      onCancel={onCancel}
      onDeleteRow={handleOnDeleteRow}
    />
  );
}

DataViewer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})),
  onClose: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  columnConfig: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

DataViewer.defaultProps = {
  data: [],
};
