import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { CSVReader } from 'react-papaparse';
import {
  suggestUniqueUsername,
  validateEmail,
  validateUsername,
  findMatchingUsers,
} from 'utils';
import { NavLink } from 'react-router-dom';
import { Button } from 'Components';
import ImportModal from './ImportModal';
import ResolutionButton from './ResolutionButton';
import classes from './importer.css';

export default function Importer(props) {
  // props will be user, onImport, onCancel
  const [showModal, setShowModal] = React.useState(false);
  const [importedData, setImportedData] = React.useState([]);
  const [validationErrors, setValidationErrors] = React.useState([]);
  const [sponsors, setSponsors] = React.useState({});
  const [rowConfig, setRowConfig] = React.useState([]);
  const [resolveSelections, setResolveSelections] = React.useState({});
  const buttonRef = React.createRef();
  const [cachedData, setCachedData] = React.useState([]);

  const validateExistingField = (field, value) => {
    return Promise.resolve(cachedData.find((elt) => elt[field] === value)); // using a Promise to minimize code changes for now
  };

  const allValues = (field, data) =>
    data
      .map((elt) =>
        typeof elt[field] === 'string' ? elt[field].toLowerCase() : elt[field]
      )
      .filter((val) => val && val !== '');

  const preCacheData = async (data) => {
    const usernames = Array.from(
      new Set(allValues('username', data).concat(allValues('sponsor', data)))
    );
    const emails = Array.from(new Set(allValues('email', data)));
    const results = await findMatchingUsers(
      ['username', 'email'],
      [...usernames, ...emails]
    );
    setCachedData(results || []);
  };

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
    await preCacheData(extractedData); // @TODO THis is a side-effect so probably should be handled via a useEffect
    const [newData, newErrors] = await validateData(extractedData);
    setShowModal(true);
    setImportedData(newData);
    setValidationErrors(newErrors);
  };

  const handleOnError = (err) => {
    console.log(err);
  };

  const handleOnDeleteRow = (row) => {
    const newData = [...importedData];
    newData.splice(row, 1);
    setImportedData(newData, async () => {
      const [imports, errors] = await validateData(newData);
      setImportedData(imports);
      setValidationErrors(errors);
    });
  };

  // 'changes' is an array of objects of the form {rowIndex, property: value}. For each unique row, we want to run
  // the validator on the data in that row.
  const handleOnChanged = (changes) => {
    const rowsToCheck = Array.from(new Set(changes.map((c) => c.rowIndex)));

    // Make copies of the existing state -- data and errors. Clear out any errors among the rows we are revalidating (as
    // specified within 'changes'). Make whatever changes to the data needed as per the 'changes' parameter
    const newData = [...importedData];
    const newValidationErrors = validationErrors.filter(
      (err) => !rowsToCheck.includes(err.rowIndex)
    );
    changes.forEach(
      // eslint-disable-next-line no-return-assign
      ({ rowIndex, ...rest }) =>
        (newData[rowIndex] = { ...newData[rowIndex], ...rest })
    );

    // revalidate the rows that had changes. Place each validated row into the correct place in the newData and merge
    // any new errors
    validateData(newData, rowsToCheck).then(([validatedData, errors]) => {
      rowsToCheck.forEach(
        // eslint-disable-next-line no-return-assign
        (row, index) => (newData[row] = validatedData[index])
      );
      setImportedData(newData);
      setValidationErrors([...newValidationErrors, ...errors]);
    });
  };

  const handleOnCancel = () => setShowModal(false);

  // Called when the user clicks on 'Submit' in the modal. Revalidate all the data. If there are any issues, update the data
  // and highligt any relevant cells. If no issues, update the data, create any new users, and invite them to the course.
  const handleOnSubmit = async (data) => {
    if (validationErrors.length > 0) {
      await preCacheData(data);
      validateData(data).then(([newData, newValidationErrors]) => {
        setImportedData(newData);
        setValidationErrors(newValidationErrors);
      });
    } else {
      setShowModal(false);
      createAndInviteMembers();
    }
  };

  /**
   * Checks the data in a row of a table. Returns an array with two elements:
   * 1. the row of data (with any changes, such as comments)
   * 2. an array of errors.
   *
   * The types of errors looked for:
   * 1. Username/email: A mis-match between an existing username and email. In this case, we want to cue the resolution by
   * the importer. The person can chose: (a) go by username (only if username exists), in which case the email for that username gets filled in. (b) go
   * by email (only if the emailalready exists), in which case the username for that email is filled in, (c) create a new user.
   * In case (c), if the username exists a new one is suggested. If the email exists, we clear it out (new user will have no
   * email).
   * 2. Usernames and emails are structured as per the validation patterns
   * 3. Duplicate usernames or emails in the import list.
   * 4. If a new user, first and last names must be there.
   * 5. If a sponsor is given, it must be an existing user.
   * 6. If an email is blank, this cannot be a gmail account.
   */
  const validateDataRow = async (dataRow, rowIndex) => {
    // initialization, including default username if needed
    const newValidationErrors = [];
    const d = { ...dataRow };
    if (!d.isGmail) d.isGmail = false; // initialize if needed
    d.comment = '';
    d.username = (
      d.username.trim() || d.firstName.trim() + d.lastName.charAt(0)
    ).toLowerCase();
    if (d.email) {
      d.email = d.email.toLowerCase().trim();
    }
    setResolveSelections((prevSelections) => {
      prevSelections[rowIndex] = null;
      return prevSelections;
    });

    // 1. handle validating whether username/email exists, whether they are consistent, and the resolution thereof
    clearChoices(rowIndex);
    const userFromUsername = await validateExistingField(
      'username',
      d.username
    );
    const userFromEmail = d.email
      ? await validateExistingField('email', d.email)
      : null;
    const isMatch =
      userFromUsername &&
      userFromEmail &&
      userFromUsername._id === userFromEmail._id;
    const isNewUser = !userFromEmail && !userFromUsername;

    if (!isMatch && !isNewUser) {
      d.comment += 'Username-email mismatch. ';
      newValidationErrors.push(
        { rowIndex, property: 'username' },
        { rowIndex, property: 'email' }
      );
      suggestUniqueUsername(d.username).then((name) => {
        const newUser = {
          username: name,
          email: userFromEmail ? '<enter an email>' : d.email,
        };
        const choices = {
          newUser,
          userFromUsername,
          userFromEmail,
          original: { ...d },
        };
        setupChoices(choices, rowIndex);
      });
    }

    // 2. handle validating the structure of usernames and emails
    const [emailResults, usernameResults] = await Promise.all([
      // if no email, don't generate an error
      validateEmail(d.email || 'dummy@dummy.com'),
      validateUsername(d.username),
    ]);

    // eslint-disable-next-line no-unused-vars
    const [emailError, validatedEmail] = emailResults;

    // eslint-disable-next-line no-unused-vars
    const [usernameError, validatedUsername] = usernameResults;

    if (emailError) {
      d.comment += 'Email is incorrectly formatted or has illegal characters. ';
      newValidationErrors.push({ rowIndex, property: 'email' });
    }

    if (usernameError) {
      d.comment += 'Username has illegal characters or is too long. ';
      newValidationErrors.push({ rowIndex, property: 'username' });
    }

    // 3. handle duplicate email or usernames in the list
    let emailDup = 0;
    let usernameDup = 0;
    importedData.forEach((u) => {
      if (u.username.toLowerCase() === d.username.toLowerCase()) {
        usernameDup += 1;
      }
      if (!!u.email && u.email === d.email) {
        emailDup += 1;
      }
    });

    if (emailDup > 1) {
      d.comment += 'Email duplicated in list. ';
      newValidationErrors.push({ rowIndex, property: 'email' });
    }

    if (usernameDup > 1) {
      d.comment += 'Username duplicated in list. ';
      newValidationErrors.push({ rowIndex, property: 'username' });
    }

    // 4. handle validating that new users must have first and last names specified
    if (isNewUser && (!d.firstName || !d.lastName)) {
      d.comment += 'First and last names are required. ';
      if (!d.firstName)
        newValidationErrors.push({ rowIndex, property: 'firstName' });
      if (!d.lastName)
        newValidationErrors.push({ rowIndex, property: 'lastName' });
    }

    // 5. handle validating that any specified sponsors must be existing users
    if (d.sponsor && d.sponsor !== '') {
      const { _id: sponsor_id } = (await validateExistingField(
        'username',
        d.sponsor
      )) || { _id: undefined };
      if (sponsor_id)
        setSponsors((prevState) => ({
          ...prevState.sponsors,
          [d.username]: sponsor_id,
        }));
      else {
        d.comment += 'No such sponsor username. ';
        newValidationErrors.push({ rowIndex, property: 'sponsor' });
      }
    }

    // 6. handle validating that a blank email cannot be a gmail account
    if (d.email === '' && d.isGmail) {
      d.comment += 'Google login may only be used if an email is specified. ';
      newValidationErrors.push(
        { rowIndex, property: 'email' },
        { rowIndex, property: 'isGmail' }
      );
    }

    return [d, newValidationErrors];
  };

  // Checks each row of the data for validation issues, returning an array of two elements:
  // 1. the data with any changes (e.g., comments about what's wrong)
  // 2. an array of pointers to the data that were problematic. Each element of the array is of the
  //    form {rowIndex, property}, where rowIndex is the row of the line that contains the error and
  //    property is the name of the data property that had the error.
  //
  // The rows argument is optional. If not given, goes through all data
  const validateData = async (data, rows) => {
    // first check for validation issues on all requested rows of the provided data, in parallel.
    const validatedInfo = await Promise.all(
      rows === undefined
        ? data.map(async (d, index) => validateDataRow(d, index))
        : rows.map(async (row) => validateDataRow(data[row], row))
    );
    // next, reconfigure the results of the above call so that we accumulate the data rows and errors
    // gathered above. validatedData will be an array of each row. For validationsErrors, because there can be
    // more than one error on each row, we have to use a spread operator in accumulation so that we
    // end up wth a simple array of errors.
    const [validatedData, newErrors] = await validatedInfo.reduce(
      ([accData, accErrors], [dataRow, rowErrors]) => [
        [...accData, dataRow],
        [...accErrors, ...rowErrors],
      ],
      [[], []]
    );
    return [validatedData, newErrors];
  };

  /**
   * The user needs to resolve a mismatch between username and email. Update rowConfig to place a ResolutionButton at that
   * row, containing the buttons needed (some combination of username, email, new user). As each selection is made, update
   * the data so that appropriate usernames and emails are shown.  NOTE: only change username and email; don't change any
   * other data in the row.
   *
   * Note: We have to keep the resolution state here because the package used by ImportModal unmounts and remounts elements
   * on each refresh. @TODO: Switch to another package for rendering an editable table.
   */

  const setupChoices = (choices, rowIndex) => {
    const action = () => (
      <ResolutionButton
        usernameChoice={choices.userFromUsername || null}
        emailChoice={choices.userFromEmail || null}
        newUserChoice={choices.newUser || null}
        selection={() => resolveSelections[rowIndex] || null}
        onSelect={(choice) => {
          if (!choice) {
            choice = {
              username: choices.original.username,
              email: choices.original.email,
            };
          }
          setImportedData((prevState) => {
            const newData = [...prevState];
            newData[rowIndex].username = choice.username;
            newData[rowIndex].email = choice.email;
            return newData;
          });
          setResolveSelections((prevState) => ({
            ...prevState,
            [rowIndex]: choice,
          }));
        }}
      />
    );
    setRowConfig((prevState) => [...prevState, { rowIndex, action }]);
  };

  // Remove any buttons from the previous validation
  const clearChoices = (rowIndex) => {
    setRowConfig((prevState) =>
      prevState
        ? prevState.filter((config) => config.rowIndex !== rowIndex)
        : []
    );
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
        data={importedData}
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
      {showModal && importModal()}
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
        config={{
          header: true,
          skipEmptyLines: true,
          transformHeader,
        }}
        noProgressBar
        noDrag
      >
        {/* Undocumented feature of CSVReader is that providing a function allows for a custom UI */}
        {() => <Button click={handleOpenDialog}>Import New Users</Button>}
      </CSVReader>
    </Fragment>
  );
}

Importer.propTypes = {
  user: PropTypes.shape({ _id: PropTypes.string }).isRequired,
  onImport: PropTypes.func.isRequired,
};
