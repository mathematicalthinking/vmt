import React from 'react';
import { suggestUniqueUsername, validateExistingField } from 'utils/validators';
import ResolutionButton from './ResolutionButton';

export default function useDataValidator(initialData) {
  const [validatedData, setValidatedData] = React.useState([]);
  const [validationErrors, setValidationErrors] = React.useState([]);
  const [sponsors, setSponsors] = React.useState({});
  const [rowConfig, setRowConfig] = React.useState([]);
  const [resolveSelections, setResolveSelections] = React.useState({});

  React.useEffect(() => {
    validateData(initialData).then(([newData, newErrors]) => {
      setValidatedData(newData);
      setValidationErrors(newErrors);
    });
  }, [initialData]);

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
   * 2. Duplicate usernames or emails in the import list.
   * 3. If a new user, first and last names must be there.
   * 4. If a sponsor is given, it must be an existing user.
   * 5. If an email is blank, this cannot be a gmail account.
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

    // 2. handle duplicate email or usernames in the list
    let emailDup = 0;
    let usernameDup = 0;
    validatedData.forEach((u) => {
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

    // 3. handle validating that new users must have first and last names specified
    if (isNewUser && (!d.firstName || !d.lastName)) {
      d.comment += 'First and last names are required. ';
      if (!d.firstName)
        newValidationErrors.push({ rowIndex, property: 'firstName' });
      if (!d.lastName)
        newValidationErrors.push({ rowIndex, property: 'lastName' });
    }

    // 4. handle validating that any specified sponsors must be existing users
    if (d.sponsor && d.sponsor !== '') {
      const { _id: sponsor_id } = await validateExistingField(
        'username',
        d.sponsor
      );
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

    // 5. handle validating that a blank email cannot be a gmail account
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
    // gathered above. newData will be an array of each row. For validationsErrors, because there can be
    // more than one error on each row, we have to use a spread operator in accumulation so that we
    // end up wth a simple array of errors.
    const [newData, newErrors] = await validatedInfo.reduce(
      ([accData, accErrors], [dataRow, rowErrors]) => [
        [...accData, dataRow],
        [...accErrors, ...rowErrors],
      ],
      [[], []]
    );
    return [newData, newErrors];
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
          setValidatedData((prevState) => {
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

  return { validatedData, validationErrors, rowConfig, sponsors };
}
