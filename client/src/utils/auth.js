import axios from 'axios';

// @TODO get rid of these cutsome promises -- axios is already retruning a promise
// so return axios.get.... will work fine
export default {
  signup: (user) => {
    return axios.post('/auth/signup', user);
  },
  login: (username, password) => {
    return axios.post('/auth/login', { username, password });
  },
  signupSpecial: (user) => {
    return axios.post('/auth/signupSpecial', user);
  },
  loginSpecial: (username) => {
    return axios.post('/auth/loginSpecial', { username });
  },
  googleLogin: (username, password) => {
    return axios.get('/auth/googleAuth', { username, password });
  },
  oauthReturn: () => {
    return axios.post('/auth/oauthReturn');
  },
  logout: (userId) => {
    return axios.post(`/auth/logout/${userId}`);
  },

  currentUser: () => {
    return axios.get('/auth/currentUser');
  },

  forgotPassword: (details) => {
    return axios.post('/auth/forgotPassword', details);
  },

  resetPassword: (password, token) => {
    return axios.post(`/auth/resetPassword/${token}`, { password });
  },
  validateResetPasswordToken: (token) => {
    return axios.get(`/auth/resetPassword/validate/${token}`);
  },
  confirmEmail: (token) => {
    return axios.get(`/auth/confirmEmail/confirm/${token}`);
  },
  resendEmailConfirmation: () => {
    return axios.get('/auth/confirmEmail/resend');
  },
};
