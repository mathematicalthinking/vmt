import React from 'react';
import { findMatchingUsers } from 'utils';

export default function useDataValidation() {
  const [sponsors, setSponsors] = React.useState({});
  const cachedData = React.useRef([]);

  const validateExistingFieldAsync = (field, value) => {
    return Promise.resolve(validateExistingField(field, value)); // using a Promise to minimize code changes for now
  };

  const validateExistingField = (field, value) => {
    return cachedData.current.find((elt) => elt[field] === value);
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
    cachedData.current = results || [];
  };

  const dummyStrategy = {
    validationErrors: [],
    comment: '',
    setProperties: [],
  };

  // This object reflects how to handle the 9 different cases when username and email are existing, new, or blank.
  // (actually, there are 11 cases; two of the strategies below handle two cases each.)
  const usernameEmailStrategy = {
    // username and email blank
    0: (rowIndex) => ({
      ...dummyStrategy,
      validationErrors: [{ rowIndex, property: 'username' }],
      comment: '* Must specify username for a new user.\n',
    }),
    // username blank, email of existing user
    1: (rowIndex, userFromUsername, userFromEmail) => ({
      ...dummyStrategy,
      validationErrors: [{ rowIndex, property: 'username' }],
      comment: '* Username filled in from existing user (based on email).\n',
      setProperties: [{ property: 'username', value: userFromEmail.username }],
    }),
    // username blank, email is new
    2: (rowIndex) => ({
      ...dummyStrategy,
      validationErrors: [{ rowIndex, property: 'username' }],
      comment: '* Must specify username for a new user.\n',
    }),
    // username is of existing user, email is blank. If email supposed to be blank, it's a valid situation.
    3: (rowIndex, userFromUsername, userFromEmail) =>
      userFromUsername.email === ''
        ? { ...dummyStrategy }
        : {
            ...dummyStrategy,
            validationErrors: [{ rowIndex, property: 'email' }],
            comment:
              '* Email filled in from existing user (based on username).\n',
            setProperties: [
              { property: 'email', value: userFromUsername.email },
            ],
          },
    // username is of existing user, email is of existing user. If they match, it's a valid situation
    4: (rowIndex, userFromUsername, userFromEmail) =>
      userFromUsername._id === userFromEmail._id
        ? { ...dummyStrategy }
        : {
            ...dummyStrategy,
            validationErrors: [
              { rowIndex, property: 'email' },
              { rowIndex, property: 'username' },
            ],
            comment: `* Username-email mismatch. Replace username with ${userFromEmail.username} or email with ${userFromUsername.email}.\n`,
          },
    // username is of existing user, email is new
    5: (rowIndex, userFromUsername, userFromEmail) => ({
      validationErrors: [{ rowIndex, property: 'email' }],
      comment: `* Imported email corrected for existing user ${userFromUsername.username}.\n`,
      setProperties: [{ property: 'email', value: userFromUsername.email }],
    }),
    // username is new, email is blank (valid situation)
    6: () => ({ ...dummyStrategy }),
    // username is new, email is of existing user
    7: (rowIndex, userFromUsername, userFromEmail) => ({
      validationErrors: [{ rowIndex, property: 'username' }],
      comment:
        '* Imported username corrected for existing user (based on email).\n',
      setProperties: [{ property: 'username', value: userFromEmail.username }],
    }),
    // username is new, email is new (valid situation)
    8: () => ({ ...dummyStrategy }),
  };

  const getUsernameEmailState = (username, email) => {
    const userFromUsername = username
      ? validateExistingField('username', username)
      : null;
    const userFromEmail = email ? validateExistingField('email', email) : null;

    let userState;
    if (userFromUsername) userState = 1;
    else if (username === '') userState = 0;
    else userState = 2;

    let emailState;
    if (userFromEmail) emailState = 1;
    else if (email === '') emailState = 0;
    else emailState = 2;

    const state = userState * 3 + emailState;

    return [userFromUsername, userFromEmail, state];
  };

  /**
   * Checks the data in a row of a table. Returns an array with two elements:
   * 1. the row of data (with any changes, such as comments)
   * 2. an array of errors.
   *
   * The types of errors looked for:
   * 1. Username/email: Different strategies are used depending on whether the username and email are existing, new, or blank.
   *    See the different strategies in the object usernameEmailStrategy above.
   * 4. If a new user, first and last names must be there.
   * 5. If a sponsor is given, it must be an existing user.
   * 6. If an email is blank, this cannot be a gmail account.
   */

  const validateDataRow = (dataRow, rowIndex) => {
    // initialization, including default username if needed
    const newValidationErrors = [];
    const d = { ...dataRow };
    if (!d.isGmail) d.isGmail = false; // initialize if needed
    d.comment = '';
    if (d.username) d.username = d.username.toLowerCase().trim();
    if (d.email) {
      d.email = d.email.toLowerCase().trim();
    }

    // 1. handle validating whether username/email exists, whether they are consistent, and the resolution thereof
    const [
      userFromUsername,
      userFromEmail,
      usernameEmailState,
    ] = getUsernameEmailState(d.username, d.email);

    const strategy = usernameEmailStrategy[usernameEmailState](
      rowIndex,
      userFromUsername,
      userFromEmail
    );
    newValidationErrors.push(...strategy.validationErrors);
    d.comment += strategy.comment;
    strategy.setProperties.forEach(
      // eslint-disable-next-line no-return-assign
      ({ property, value }) => (d[property] = value)
    );

    // 4. handle validating that new users must have first and last names specified
    const isNewUser = !userFromEmail && !userFromUsername;
    if (isNewUser && (!d.firstName || !d.lastName)) {
      d.comment += '* First and last names are required for new users.\n ';
      if (!d.firstName)
        newValidationErrors.push({ rowIndex, property: 'firstName' });
      if (!d.lastName)
        newValidationErrors.push({ rowIndex, property: 'lastName' });
    }

    // 5. handle validating that any specified sponsors must be existing users
    if (d.sponsor && d.sponsor !== '') {
      const { _id: sponsor_id } = validateExistingField(
        'username',
        d.sponsor
      ) || { _id: undefined };
      if (sponsor_id)
        setSponsors((prevState) => ({
          ...prevState.sponsors,
          [d.username]: sponsor_id,
        }));
      else {
        d.comment += "* Teacher's username does not exist.\n";
        newValidationErrors.push({ rowIndex, property: 'sponsor' });
      }
    }

    // 6. handle validating that a blank email cannot be a gmail account
    if (d.email === '' && d.isGmail) {
      d.comment +=
        '* Google login may only be used if an email is specified.\n';
      newValidationErrors.push(
        { rowIndex, property: 'email' },
        { rowIndex, property: 'isGmail' }
      );
    }

    return [d, newValidationErrors];
  };

  // return an error array for any duplicates in the 'property' column of the data.
  const duplicateFinder = (data, property) => {
    const values = data.map((dataRow) => dataRow[property]);
    const duplicatedRows = data.reduce((acc, dataRow, rowIndex) => {
      const loc = values.indexOf(dataRow[property]);
      if (loc !== rowIndex) {
        acc.add(loc);
        acc.add(rowIndex);
      }
      return acc;
    }, new Set());
    return Array.from(duplicatedRows).map((rowIndex) => ({
      rowIndex,
      property,
    }));
  };

  // return an error array for duplicates in all the properties columns of the data.
  const findDuplicates = (data, properties) => {
    return properties.reduce(
      (acc, property) => [...acc, ...duplicateFinder(data, property)],
      []
    );
  };

  // Checks each row of the data for validation issues, returning an array of three elements:
  // 1. the data with any changes (e.g., comments about what's wrong)
  // 2. an array of pointers to the data that were problematic. Each element of the array is of the
  //    form {rowIndex, property}, where rowIndex is the row of the line that contains the error and
  //    property is the name of the data property that had the error.
  // 3. all of the sponsors represented in the data (used by the client)
  //
  // The rows argument is optional. If not given, we go through all data
  const validateData = async (data, rows) => {
    await preCacheData(data);

    // check for duplicates; don't do any other validation if we find duplicates
    const duplicateErrors = findDuplicates(data, ['username', 'email']);
    if (duplicateErrors.length > 0) {
      const commentsForDuplicates = duplicateErrors.reduce(
        (acc, error) => ({
          ...acc,
          [error.rowIndex]: (acc[error.rowIndex] || '').concat(
            `* Duplicated ${error.property}.\n`
          ),
        }),
        {}
      );
      const validatedData = data.map((dataRow, index) => ({
        ...dataRow,
        comment: commentsForDuplicates[index] || '',
      }));
      return [validatedData, duplicateErrors, sponsors];
    }

    // check for validation issues on all requested rows of the provided data, in parallel.
    // Note that right now, validateDataRow isn't async, so unclear whether we are saving any time using Promise.all
    const validatedInfo = await Promise.all(
      rows === undefined
        ? data.map(async (d, index) => validateDataRow(d, index))
        : rows.map(async (row) => validateDataRow(data[row], row))
    );

    // Reconfigure the results of the above call so that we accumulate the data rows and errors
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
    return [validatedData, newErrors, sponsors];
  };

  // return validateExistingField as an async function because in the future, it might be one.
  return { validateData, validateExistingField: validateExistingFieldAsync };
}
