import * as yup from 'yup';
import api from 'utils/apiRequests';

const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const usernamePattern = /^[a-z0-9_]{3,30}$/;
const disallowedUsernames = ['admin', 'encompass', 'vmt', 'virtualmathteams'];

const trimmed = yup.string().trim();

const passwordSchema = trimmed.min(10).max(72);

const validateSchema = (schema, value) => {
  return schema
    .validate(value)
    .then((validatedValue) => {
      return [null, validatedValue];
    })
    .catch((err) => {
      return [err.errors[0], null];
    });
};

export const emailSchema = trimmed.matches(emailPattern);
export const usernameSchema = trimmed
  .lowercase()
  .matches(usernamePattern)
  .notOneOf(disallowedUsernames);

export const validateEmail = (val) => {
  return validateSchema(emailSchema.required(), val);
};

export const validateUsername = (val) => {
  return validateSchema(usernameSchema.required(), val);
};

export const validateForgotPassword = async (email, username) => {
  const [emailResults, usernameResults] = await Promise.all([
    validateEmail(email),
    validateUsername(username),
  ]);

  const [emailError, validatedEmail] = emailResults;

  const [usernameError, validatedUsername] = usernameResults;

  if (validatedEmail && validatedUsername) {
    return ['Please provide only one of email address or username', null];
  }

  if (emailError && usernameError) {
    return ['Please provide a valid email address or username', null];
  }

  if (validatedEmail) {
    return [null, { email: validatedEmail }];
  }
  return [null, { username: validatedUsername }];
};

const resetPasswordSchema = yup.object().shape({
  password: passwordSchema.required(),
  confirmPassword: yup
    .mixed()
    .test('doPasswordsMatch', 'Passwords do not match', function(value) {
      return value === this.parent.password;
    }),
  token: trimmed.required(),
});

export const validateResetPassword = (password, confirmPassword, token) => {
  return validateSchema(resetPasswordSchema, {
    password,
    confirmPassword,
    token,
  });
};

const basicTokenSchema = yup.object().shape({
  token: trimmed.required('Invalid token'),
});

export const validateBasicToken = (token) => {
  return validateSchema(basicTokenSchema, { token });
};

// returns false if no existing value for the field; returns the user object if it does exist

export const validateExistingField = async (field, value) => {
  return api
    .get('user', { [field]: value })
    .then((res) => {
      return (
        res.data &&
        res.data.results &&
        res.data.results.length > 0 &&
        res.data.results[0]
      );
    })
    .catch((err) => console.error(err));
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
