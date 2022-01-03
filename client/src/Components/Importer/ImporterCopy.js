import React, { Fragment } from 'react';
import { CSVReader } from 'react-papaparse';
import { validateExistingField } from 'utils/validators';
import { NavLink } from 'react-router-dom';
import { Button } from 'Components';
import ImportModal from './ImportModal';
import classes from './importer.css';
import useDataValidator from './DataValidator';

export default function Importer(props) {
  // props will be user, onImport, onCancel
  const [showModal, setShowModal] = React.useState(false);
  const [importedData, setImportedData] = React.useState([]);
  const buttonRef = React.createRef();

  const {
    validatedData,
    validationErrors,
    rowConfig,
    sponsors,
  } = useDataValidator(importedData);

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
    setShowModal(true);
    setImportedData(extractedData);
  };

  const handleOnError = (err) => {
    console.log(err);
  };

  const handleOnDeleteRow = (row) => {
    const newData = [...importedData];
    newData.splice(row, 1);
    setImportedData(newData);
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
    setImportedData(newData);
  };

  const handleOnCancel = () => setShowModal(false);

  // Called when the user clicks on 'Submit' in the modal. Revalidate all the data. If there are any issues, update the data
  // and highligt any relevant cells. If no issues, update the data, create any new users, and invite them to the course.
  const handleOnSubmit = (data) => {
    if (validationErrors.length > 0) {
      setImportedData(data);
    } else {
      setShowModal(false);
      createAndInviteMembers();
    }
  };

  const createAndInviteMembers = async () => {
    const { user: creator, onImport } = props;
    const userObjects = await Promise.all(
      importedData.map(async (user) => {
        const existingUser = await validateExistingField(
          'username',
          user.username
        );
        const { organization, identifier, ...rest } = user;
        return existingUser
          ? {
              ...existingUser,
              metadata: { organization, identifier },
              sponsor: sponsors[user.username] || creator._id,
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
            header: 'Last Name* (full, inital, or other)',
          },
          { property: 'organization', header: 'Affiliation' },
          { property: 'identifier', header: 'Student or Org ID' },
          { property: 'sponsor', header: 'Teacher VMT Username' },
          {
            property: 'comment',
            header: 'Comments (* req)',
            style: { color: 'red' },
            readOnly: true,
          },
        ]}
        highlights={validationErrors}
        rowConfig={rowConfig}
        onChanged={handleOnChanged}
        onSubmit={handleOnSubmit}
        onCancel={handleOnCancel}
        onDeleteRow={handleOnDeleteRow}
      />
    );
  };

  return (
    <Fragment>
      {importModal()}
      <div className={classes.Instructions}>
        <i className="far fa-question-circle fa-2x" />
        <div className={classes.TooltipContent}>
          <p>
            The search bar allows for the searching and addition of existing VMT
            Users. By using the Import feature, new users can be created for
            your course. <br /> For csv formatting and importing guides, please
            see the VMT{' '}
            <NavLink
              exact
              to="/instructions"
              className={classes.Link}
              activeStyle={{ borderBottom: '1px solid #2d91f2' }}
            >
              Instructions
            </NavLink>
          </p>
        </div>
      </div>
      <CSVReader
        ref={buttonRef}
        onFileLoad={handleOnFileLoad}
        onError={handleOnError}
        config={{ header: true, skipEmptyLines: true }}
        noProgressBar
        noDrag
      >
        {/* Undocumented feature of CSVReader is that providing a function allows for a custom UI */}
        {() => <Button click={handleOpenDialog}>Import New Users</Button>}
      </CSVReader>
    </Fragment>
  );
}
