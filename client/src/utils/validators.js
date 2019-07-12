import * as yup from 'yup';

const trimmed = yup.string().trim();

const validateSchema = (schema, value) => {
  return schema
    .validate(value)
    .then(validatedValue => {
      return [null, validatedValue];
    })
    .catch(err => {
      return [err.errors[0], null];
    });
};

export const emailSchema = trimmed.email();
export const usernameSchema = trimmed.lowercase();

export const validateEmail = val => {
  return validateSchema(emailSchema.required(), val);
};

export const validateUsername = val => {
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
