import API from './apiRequests';
import { validateExistingField } from './validators';

/**
 * Returns users from the DB that have any of the provided values in any of the provided fields.
 * Note: Embedded arrays and objects don't get parsed (i.e., they remain as strings) on the server side, so this
 * generic function will work while a more specific reuse of 'get' (with embedded {$in: [...]}) in the parameters
 * would not.
 */
export const findMatchingUsers = async (fields, values) => {
  const results = await API.findAllMatching('user', fields, values);
  return results && results.data && results.data.results;
};

export const suggestUniqueUsername = (username) => {
  const uniqueName = validateExistingField('username', username)
    .then((isExisting) => {
      return !isExisting
        ? username
        : suggestUniqueUsername(username + Math.floor(Math.random() * 1000));
    })
    .catch((err) => {
      console.log(err);
    });

  return uniqueName;
};
