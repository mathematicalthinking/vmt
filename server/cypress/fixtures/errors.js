module.exports = {
  forgotPassword: {
    emptyForm: 'Please provide a valid email address or username',
    tooMuchInfo: 'Please provide only one of email address or username',
    noUserWithEmail:
      'There is no Virtual Math Teams account associated with that email address',
    noUserWithUsername:
      'There is no Virtual Math Teams account associated with that username',
  },
  resetPassword: {
    invalidToken: 'Password reset token is invalid or has expired',
    emptyForm: 'password must be at least 10 characters',
    mismatch: 'Passwords do not match',
    tooShort: 'password must be at least 10 characters',
  },
  login: {
    invalidPassword: 'Invalid password',
  },
  confirmEmail: {
    invalidToken: 'Confirm email token is invalid',
    expiredToken: 'Confirm email token is expired',
  },
};
