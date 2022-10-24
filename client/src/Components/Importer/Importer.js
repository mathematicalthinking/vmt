import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { CSVReader } from 'react-papaparse';
import { Button } from 'Components';
import ImportModal from './ImportModal';
import useDataValidation from './dataValidation';

export default function Importer(props) {
  const { buttonText, preImportAction } = props;

  const [showModal, setShowModal] = React.useState(false);
  const [importedData, setImportedData] = React.useState([]);
  const buttonRef = React.createRef();
  const {
    validatedData,
    validationErrors,
    sponsors,
    getUser,
  } = useDataValidation(importedData);

  const handleOpenDialog = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (buttonRef.current) {
      buttonRef.current.open(e);
    }
  };

  const handleOnFileLoad = async (data) => {
    const extractedData = data
      .map((d) => d.data)
      .filter((d) => Object.values(d).some((val) => val !== '')); // ignore any blank lines
    setImportedData(extractedData);
    setShowModal(true);
  };

  const handleOnError = (err) => {
    console.log(err);
  };

  const handleOnDeleteRow = (row) => {
    const newData = [...importedData];
    newData.splice(row, 1);
    setImportedData(newData);
  };

  // 'changes' is an array of objects of the form {rowIndex, property: value}.
  const handleOnChanged = (changes) => {
    const newData = [...importedData];
    changes.forEach(
      // eslint-disable-next-line no-return-assign
      ({ rowIndex, ...rest }) =>
        (newData[rowIndex] = { ...newData[rowIndex], ...rest })
    );

    setImportedData(newData);
  };

  const handleOnCancel = () => setShowModal(false);

  // Called when the user clicks on 'Submit' in the modal. Revalidate all the data. If there are any issues, update the data
  // and highligt any relevant cells. If no issues, update the data, create any new users, and invite them to the course.
  const handleOnSubmit = async (data) => {
    if (validationErrors.length > 0) {
      setImportedData(data);
    } else {
      if (preImportAction) await preImportAction();
      createAndInviteMembers();
      setShowModal(false);
    }
  };

  const createAndInviteMembers = async () => {
    const { user: creator, onImport } = props;
    const userObjects = await Promise.all(
      importedData.map(async (user) => {
        const existingUser = await getUser(user.username);
        const { organization, identifier, isGmail, ...rest } = user;
        return existingUser
          ? {
              ...existingUser,
              metadata: { organization, identifier },
              sponsor: sponsors[user.username] || creator._id,
              isGmail,
            }
          : {
              accountType: 'pending',
              ...rest,
              metadata: { organization, identifier },
              sponsor: sponsors[user.username] || creator._id,
            };
      })
    );

    onImport(userObjects);
  };

  const transformHeader = (header) => {
    switch (header.toLowerCase()) {
      case 'isgmail':
        return 'isGmail';
      case 'firstname':
        return 'firstName';
      case 'lastname':
        return 'lastName';
      default:
        return header.toLowerCase();
    }
  };

  const importModal = () => {
    return (
      <ImportModal
        show={showModal}
        data={validatedData}
        columnConfig={[
          { property: 'username', header: 'Username*' },
          { property: 'email', header: 'Email' },
          {
            property: 'isGmail',
            header: 'Require Login via Google with Email',
            type: 'boolean',
          },
          { property: 'firstName', header: 'First Name*' },
          {
            property: 'lastName',
            header: 'Last Name* (full, initial, or other)',
          },
          { property: 'organization', header: 'Affiliation' },
          { property: 'identifier', header: 'Student or Org ID' },
          { property: 'sponsor', header: 'Teacher VMT Username' },
          {
            property: 'comment',
            header: 'Comments (* req)',
            style: { color: 'red', textAlign: 'left', whiteSpace: 'pre-wrap' },
            readOnly: true,
          },
        ]}
        highlights={validationErrors}
        onChanged={handleOnChanged}
        onSubmit={handleOnSubmit}
        onCancel={handleOnCancel}
        onDeleteRow={handleOnDeleteRow}
      />
    );
  };

  return (
    <Fragment>
      {showModal && importModal()}
      <CSVReader
        ref={buttonRef}
        onFileLoad={handleOnFileLoad}
        onError={handleOnError}
        config={{
          header: true,
          skipEmptyLines: true,
          transformHeader,
        }}
        noProgressBar
        noDrag
      >
        {/* Undocumented feature of CSVReader is that providing a function allows for a custom UI */}
        {() => <Button click={handleOpenDialog}>{buttonText}</Button>}
      </CSVReader>
    </Fragment>
  );
}

Importer.propTypes = {
  user: PropTypes.shape({ _id: PropTypes.string }).isRequired,
  onImport: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired,
  preImportAction: PropTypes.func,
};

Importer.defaultProps = {
  preImportAction: null,
};
